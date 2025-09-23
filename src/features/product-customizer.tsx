import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import Loader from "../components/loader";
import {
  Stage,
  Layer,
  Image,
  Text,
  Rect,
  Transformer,
  Group,
} from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";

type PocketArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type TextItem = {
  id: string;
  text: string;
  x: number;
  y: number;
  isEditing: boolean;
  width?: number;
  height?: number;
  rotation?: number;
};

interface DeleteButtonProps {
  textItem: TextItem;
  onClick: (e: KonvaEventObject<MouseEvent>) => void;
}

export default function ProductCustomizer() {
  const [productId, setProductId] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string>(""); // For Shopify product image
  const [texts, setTexts] = useState<
    Array<{
      id: string;
      text: string;
      x: number;
      y: number;
      isEditing: boolean;
    }>
  >([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null); // For user uploaded image
  const [productImageSize, setProductImageSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const stageRef = useRef<Konva.Stage>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pocketArea, setPocketArea] = useState<PocketArea>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Read query params once on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("product") || "8620472369288";
    setProductId(pid);
  }, []);

  // Fetch product details when productId is available
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const res = await api.get(`/products/shopify/${productId}`);
      return res.data.product;
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  });

  // Load images using the use-image hook
  const [productImage] = useImage(imageSrc);
  const [uploadedImg] = useImage(uploadedImage || ""); // Handle uploaded image

  // Set the product image once fetched from Shopify
  useEffect(() => {
    if (product && product.image) {
      setImageSrc(product.image.src); // Set the image URL
    }
  }, [product]);

  useEffect(() => {
    if (productImage) {
      setProductImageSize({
        width: productImage.width,
        height: productImage.height,
      });
    }
  }, [productImage]);

  // Add this after your product image useEffect
  // useEffect(() => {
  //   if (productImage) {
  //     // Example: Define pocket area as percentage of image size
  //     // Adjust these values based on your actual shirt image
  //     setPocketArea({
  //       x: productImage.width * 0.6, // 60% from left
  //       y: productImage.height * 0.3, // 30% from top
  //       width: productImage.width * 0.2, // 20% of image width
  //       height: productImage.height * 0.2, // 20% of image height
  //     });
  //   }
  // }, [productImage]);

  // Update the area calculation useEffect
  useEffect(() => {
    if (productImage) {
      // Define the center area of the shirt
      const newPocketArea = {
        x: productImage.width * 0.25,
        y: productImage.height * 0.2,
        width: productImage.width * 0.5,
        height: productImage.height * 0.4,
      };
      setPocketArea(newPocketArea);

      // Reset uploaded image position when pocket area changes
      setUploadedImagePos({
        x: newPocketArea.x,
        y: newPocketArea.y,
      });
    }
  }, [productImage]);
  const constrainToArea = (
    x: number,
    y: number,
    elementWidth: number,
    elementHeight: number
  ) => {
    return {
      x: Math.max(
        pocketArea.x,
        Math.min(x, pocketArea.x + pocketArea.width - elementWidth)
      ),
      y: Math.max(
        pocketArea.y,
        Math.min(y, pocketArea.y + pocketArea.height - elementHeight)
      ),
    };
  };

  const transformersRef = useRef<{ [key: string]: Konva.Transformer }>({});
  const [newTextValue, setNewTextValue] = useState<string>("");

  const [selectedImage, setSelectedImage] = useState<boolean>(false);
  const [uploadedImagePos, setUploadedImagePos] = useState({
    x: pocketArea.x,
    y: pocketArea.y,
  });

  // Add this handler function near your other handlers
  const handleDeleteImage = () => {
    setUploadedImage(null);
    setSelectedImage(false);
  };

  //   // Add text editing capabilities with HTML textarea
  //  const handleAddText = () => {
  //   const id = Date.now().toString();
  //   const newText = {
  //     id,
  //     text: "Your Text",  // Placeholder text
  //     x: pocketArea.x,
  //     y: pocketArea.y,
  //     isEditing: true     // Start in editing mode
  //   };
  //   setTexts([...texts, newText]);
  //   setSelectedId(id);    // Select the new text immediately
  // };

  const handleAddText = () => {
    if (newTextValue.trim()) {
      const newText = {
        id: Date.now().toString(),
        text: newTextValue,
        x: pocketArea.x,
        y: pocketArea.y,
        isEditing: false,
        width: 80,
        height: 40,
        rotation: 0,
      };
      setTexts([...texts, newText]);
      setNewTextValue("");
      setSelectedId(newText.id);
    }
  };

  // Add delete handler
  const handleDeleteText = (id: string) => {
    setTexts(texts.filter((t) => t.id !== id));
    setSelectedId(null);
  };

  // Update the text editing effect
  useEffect(() => {
    if (selectedId !== null) {
      const textNode = texts.find((t) => t.id === selectedId);
      if (textNode && textNode.isEditing) {
        const textarea = document.createElement("textarea");
        const stage = stageRef.current;

        if (!stage) return;

        const container = stage.container();

        // Only show placeholder if it's a new text
        textarea.value = textNode.text === "Your Text" ? "" : textNode.text;
        textarea.placeholder = "Your Text";
        textarea.style.position = "absolute";
        textarea.style.top = `${textNode.y + stage.container().offsetTop}px`;
        textarea.style.left = `${textNode.x + stage.container().offsetLeft}px`;
        textarea.style.width = "200px";
        textarea.style.height = "50px";
        textarea.style.fontSize = "16px";
        textarea.style.border = "1px solid #999";
        textarea.style.padding = "5px";
        textarea.style.margin = "0px";
        textarea.style.overflow = "hidden";
        textarea.style.background = "none";
        textarea.style.outline = "none";
        textarea.style.resize = "none";
        textarea.style.zIndex = "1000";
        textarea.style.color = "#fff"; // Added white color for input text
        textarea.style.setProperty("::placeholder", "#fff");
        textarea.style.setProperty("::-webkit-input-placeholder", "#fff");
        textarea.style.setProperty("::-moz-placeholder", "#fff");

        container.appendChild(textarea);
        textarea.focus();

        const handleBlur = () => {
          const newText = textarea.value.trim();
          setTexts(
            texts.map((t) =>
              t.id === selectedId
                ? { ...t, text: newText || "Your Text", isEditing: false }
                : t
            )
          );
          container.removeChild(textarea);
          setSelectedId(null);
        };

        textarea.addEventListener("blur", handleBlur);

        textarea.addEventListener("keydown", function (e) {
          if (e.key === "Enter" && !e.shiftKey) {
            textarea.blur();
          }
        });

        return () => {
          if (container.contains(textarea)) {
            textarea.removeEventListener("blur", handleBlur);
            container.removeChild(textarea);
          }
        };
      }
    }
  }, [selectedId, texts]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imgURL = URL.createObjectURL(file);
      setUploadedImage(imgURL);
      // Set initial position to pocket area coordinates
      setUploadedImagePos({
        x: pocketArea.x,
        y: pocketArea.y,
      });
    }
  };

  const DeleteButton: React.FC<DeleteButtonProps> = ({ textItem, onClick }) => (
    <Group x={textItem.x - 20} y={textItem.y - 20} onClick={onClick}>
      <Rect width={15} height={15} fill="red" cornerRadius={2} />
      <Text text="×" fill="white" fontSize={13} x={4} y={1} />
    </Group>
  );

  return (
    <div style={{ padding: "1rem" }}>
      <div className="flex justify-center">
        <h1 className="text-center text-[56px] text-[#252525]">
          Product Customizer
        </h1>
      </div>

      {isLoading && (
        <div className="flex justify-center">
          <Loader />
        </div>
      )}

      {!isLoading && (
        <div className="flex gap-8 mt-5">
          {/* Controls */}
          <div className="flex flex-col gap-3 w-40 pt-4">
            <input
              type="text"
              value={newTextValue}
              onChange={(e) => setNewTextValue(e.target.value)}
              placeholder="Enter text"
              className="border p-2 rounded"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddText();
                }
              }}
            />
            <button
              onClick={handleAddText}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Text
            </button>

            <label className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer text-center">
              Add Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Display product image and customizer */}
          <div className="flex-1">
            <Stage
              width={productImageSize.width}
              height={productImageSize.height}
              ref={stageRef}
              className=" mt-4 "
            >
              <Layer>
                {/* Product Image */}
                {productImage && (
                  <Image
                    image={productImage}
                    width={productImage.width}
                    height={productImage.height}
                    x={0}
                    y={0}
                  />
                )}

                {/* Visual indicator for pocket area - only visible during drag */}
                {isDragging && (
                  <Rect
                    x={pocketArea.x}
                    y={pocketArea.y}
                    width={pocketArea.width}
                    height={pocketArea.height}
                    stroke="rgba(0, 255, 0, 0.5)"
                    strokeWidth={2}
                    dash={[5, 5]}
                  />
                )}

                {/* Draggable Text elements */}
                {texts.map((textItem) => (
                  <React.Fragment key={textItem.id}>
                    <Text
                      id={textItem.id}
                      text={textItem.text}
                      x={textItem.x}
                      y={textItem.y}
                      fontSize={20}
                      fill="#fff"
                      draggable
                      onClick={(e) => {
                        e.cancelBubble = true;
                        setSelectedId(textItem.id);
                      }}
                      onDragStart={() => {
                        setIsDragging(true);
                        setSelectedId(textItem.id);
                      }}
                      onDragEnd={() => {
                        setIsDragging(false);
                      }}
                      onDragMove={(e) => {
                        const node = e.target;
                        const { x, y } = constrainToArea(
                          node.x(),
                          node.y(),
                          node.width(),
                          node.height()
                        );
                        node.position({ x, y });
                        setTexts(
                          texts.map((t) =>
                            t.id === textItem.id ? { ...t, x, y } : t
                          )
                        );
                      }}
                    />

                    {selectedId === textItem.id && (
                      <>
                        <Transformer
                          ref={(ref) => {
                            if (ref && stageRef.current) {
                              transformersRef.current[textItem.id] = ref;
                              const node = stageRef.current.findOne(
                                `#${textItem.id}`
                              );
                              if (node) {
                                ref.nodes([node]);
                                const layer = ref.getLayer();
                                if (layer) {
                                  layer.batchDraw();
                                }
                              }
                            }
                          }}
                          rotateEnabled={true}
                          resizeEnabled={true}
                          padding={2}
                          anchorSize={6}
                          borderStroke="#00ff00"
                          borderStrokeWidth={0.5}
                          anchorStroke="#00ff00"
                          anchorFill="#fff"
                          boundBoxFunc={(_oldBox, newBox) => {
                            // Ensure the transform stays within pocket area
                            const { x, y } = constrainToArea(
                              newBox.x,
                              newBox.y,
                              newBox.width,
                              newBox.height
                            );
                            return {
                              ...newBox,
                              x,
                              y,
                              width: Math.max(
                                30,
                                Math.min(newBox.width, pocketArea.width)
                              ),
                              height: Math.max(
                                30,
                                Math.min(newBox.height, pocketArea.height)
                              ),
                            };
                          }}
                        />
                        <DeleteButton
                          textItem={textItem}
                          onClick={(e) => {
                            e.cancelBubble = true;
                            handleDeleteText(textItem.id);
                          }}
                        />
                      </>
                    )}
                  </React.Fragment>
                ))}

                {/* Draggable User-uploaded Image with constraints */}
                {uploadedImg && (
                  <React.Fragment>
                    <Image
                      image={uploadedImg}
                      width={Math.min(100, pocketArea.width)}
                      height={Math.min(100, pocketArea.height)}
                      x={uploadedImagePos.x}
                      y={uploadedImagePos.y}
                      draggable
                      onClick={(e) => {
                        e.cancelBubble = true;
                        setSelectedImage(true);
                      }}
                      onDragStart={() => {
                        setIsDragging(true);
                        setSelectedImage(true);
                      }}
                      onDragEnd={() => setIsDragging(false)}
                      onDragMove={(e) => {
                        const imageNode = e.target;
                        const { x, y } = constrainToArea(
                          imageNode.x(),
                          imageNode.y(),
                          imageNode.width(),
                          imageNode.height()
                        );
                        imageNode.position({ x, y });
                        setUploadedImagePos({ x, y }); // Update the image position
                      }}
                    />
                    {selectedImage && (
                      <Group
                        x={uploadedImagePos.x - 20}
                        y={uploadedImagePos.y - 20}
                        onClick={() => handleDeleteImage()}
                      >
                        <Rect
                          width={15}
                          height={15}
                          fill="red"
                          cornerRadius={2}
                        />
                        <Text text="×" fill="white" fontSize={13} x={4} y={1} />
                      </Group>
                    )}
                  </React.Fragment>
                )}
              </Layer>
            </Stage>
          </div>
        </div>
      )}
    </div>
  );
}
