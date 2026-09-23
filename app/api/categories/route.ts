import { NextResponse } from 'next/server';
import { SEEDED_PRICE_BANDS } from '@/lib/supabase';

export async function GET() {
  const categories = [
    {
      id: 'produce',
      label: 'Fresh Produce (Vegetables & Fruits)',
      description: 'Street sabzi mandi and fruit vendor items (tomatoes, onions, potatoes, bananas, apples, etc.)',
      popularItems: ['Tomatoes', 'Onions', 'Potatoes', 'Bananas', 'Apples', 'Spinach', 'Green Chillies']
    },
    {
      id: 'electronics',
      label: 'Electronics Accessories',
      description: 'Street-side electronics & mobile stalls (chargers, USB-C cables, earphones, tempered glass, cases)',
      popularItems: ['USB-C Fast Charging Cable', 'Wired 3.5mm Earphones', 'Wall Charger Adapter (18W)', 'Tempered Glass Screen Protector', 'Silicon Mobile Back Cover']
    },
    {
      id: 'apparel',
      label: 'Apparel (Basic Clothing Items)',
      description: 'Weekly flea markets and bazaar clothing stalls (t-shirts, kurtis, jeans, track pants, belts, socks)',
      popularItems: ['Men Plain Cotton T-Shirt', 'Women Cotton Kurti', 'Denim Jeans (Local Stall)', 'Cotton Socks (Pack of 3)', 'Leather-Finish Belt']
    }
  ];

  return NextResponse.json({
    success: true,
    categories,
    totalSeedRecords: SEEDED_PRICE_BANDS.length
  });
}
