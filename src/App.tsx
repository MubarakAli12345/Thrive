import { useEffect, useState } from 'react';

export default function App() {
  const [productId, setProductId] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('product');
    const ptitle = params.get('title');

    console.log('✅ Product ID from URL:', pid);
    console.log('✅ Product Title from URL:', ptitle);

    setProductId(pid);
    setTitle(ptitle);
  }, []);

  return (
    <div>
      <h1>Product Customizer</h1>
      <p>Product ID: {productId}</p>
      <p>Title: {title}</p>
    </div>
  );
}
