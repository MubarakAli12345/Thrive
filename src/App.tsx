import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Loader from './components/loader';

export default function App() {
  const [productId, setProductId] = useState<string | null>(null);

  // ✅ Read query params once on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('product') || '8620472369288';
    const ptitle = params.get('title');

    console.log('✅ Product ID from URL:', pid);
    console.log('✅ Product Title from URL:', ptitle);

    setProductId(pid);
  }, []);

  // ✅ Fetch product details only when productId is available
  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const res = await axios.get(
        `http://localhost:8000/api/products/shopify/${productId}`
      );
      return res.data.product;
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  });

  return (
    <div style={{ padding: '1rem' }}>
    <div className="flex justify-center">
  <h1 className="text-center text-[56px] text-[#252525]">Product Customizer</h1>
</div>


      {isLoading &&<div className='flex justify-center'> <Loader/></div>}

      {!isLoading && (
<>
  <div
    style={{
      display: 'flex',                // center horizontally
      justifyContent: 'center',
      marginTop: '2rem',              // space from the top
    }}
  >
    <div
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '1rem 1.5rem',
        maxWidth: '320px',
        backgroundColor: '#fafafa',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        textAlign: 'center',          // center text inside the card
      }}
    >
      <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem' }}>
        {product?.title || 'Product Details'}
      </h2>

      <p style={{ margin: '0.25rem 0', color: '#555' }}>
        <strong>ID:</strong> {product?.id}
      </p>

      {isError && (
        <p style={{ color: '#d32f2f', marginTop: '0.5rem' }}>
          Error: {(error as Error).message}
        </p>
      )}

      {product?.image && (
        <div style={{ marginTop: '0.75rem' }}>
          <img
            src={product.image.src}
            alt={product.title}
            style={{
              width: '200px',
              borderRadius: '6px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}
          />
        </div>
      )}
    </div>
  </div>
</>


      )}
    </div>
  );
}
