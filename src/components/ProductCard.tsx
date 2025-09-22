// src/components/ProductCard.tsx
import type { ShopifyProduct } from "../types/shopify-product";

interface ProductCardProps {
  product: ShopifyProduct;
  isError: boolean;
  error: unknown;
}

export default function ProductCard({ product, isError, error }: ProductCardProps) {
  return (
    <div className="flex justify-center mt-8">
      <div className="w-full max-w-[500px] rounded-lg border border-gray-200 bg-gray-50 p-6 text-center shadow-md">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          {product?.title || "Product Details"}
        </h2>

        <p className="my-1 text-gray-600">
          <strong>ID:</strong> {product?.id}
        </p>

        {isError && (
          <p className="mt-2 text-red-600">
            Error: {(error as Error).message}
          </p>
        )}

        {product?.image && (
          <div className="mt-3 flex justify-center">
            <img
              src={product.image.src}
              alt={product.title}
              className="w-[200px] rounded-md shadow-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}
