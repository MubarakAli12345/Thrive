import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import Loader from "../components/loader";
import { Stage, Layer, Image, Text } from "react-konva";
import useImage from "use-image";
import Konva from "konva";

type PocketArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

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
  const [, setIsDragging] = useState<boolean>(false);

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
  useEffect(() => {
    if (productImage) {
      // Example: Define pocket area as percentage of image size
      // Adjust these values based on your actual shirt image
      setPocketArea({
        x: productImage.width * 0.6, // 60% from left
        y: productImage.height * 0.3, // 30% from top
        width: productImage.width * 0.2, // 20% of image width
        height: productImage.height * 0.2, // 20% of image height
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

  // Add text editing capabilities with HTML textarea
  const handleAddText = () => {
    const id = Date.now().toString();
    const newText = {
      id,
      text: "Your Text", // Placeholder text
      x: pocketArea.x,
      y: pocketArea.y,
      isEditing: true, // Start in editing mode
    };
    setTexts([...texts, newText]);
    setSelectedId(id); // Select the new text immediately
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
        textarea.style.height = "30px"; // Reduced height to match text line height
        textarea.style.fontSize = "20px"; // Match the Text component's fontSize
        textarea.style.lineHeight = "20px"; // Add line height to match fontSize
        textarea.style.border = "1px solid #999";
        textarea.style.padding = "2px 5px"; // Adjusted padding
        textarea.style.border = "1px solid #999";
        textarea.style.padding = "5px";
        textarea.style.margin = "0px";
        textarea.style.overflow = "hidden";
        textarea.style.background = "rgba(0, 0, 0, 0.1)";
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
        <div className="flex gap-4">
          {/* Controls */}
          <div className="flex flex-col gap-2 w-40">
            <button
              onClick={handleAddText}
              className="px-4 py-2 mt-3.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Text
            </button>
          </div>

          {/* Display product image and customizer */}
          <div className="flex-1">
            <Stage
              width={productImageSize.width}
              height={productImageSize.height}
              ref={stageRef}
              className="border mt-4 bg-white"
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

                {/* Draggable Text elements */}
                {texts.map((textItem) => (
                  <Text
                    key={textItem.id}
                    text={
                      textItem.text === "Your Text" && textItem.isEditing
                        ? ""
                        : textItem.text
                    }
                    x={textItem.x}
                    y={textItem.y}
                    fontSize={20}
                    fill={
                      textItem.text === "Your Text"
                        ? "rgba(255, 255, 255, 0.5)"
                        : "#fff"
                    } // Changed to white with transparency for placeholder
                    draggable
                    onClick={() => {
                      setTexts(
                        texts.map((t) =>
                          t.id === textItem.id ? { ...t, isEditing: true } : t
                        )
                      );
                      setSelectedId(textItem.id);
                    }}
                    onDragStart={() => {
                      setIsDragging(true);
                      setSelectedId(textItem.id);
                    }}
                    onDragEnd={() => {
                      setIsDragging(false);
                      setSelectedId(null);
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
                ))}
              </Layer>
            </Stage>
          </div>
        </div>
      )}
    </div>
  );
}
