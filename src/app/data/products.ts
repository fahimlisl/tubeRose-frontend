export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'acne' | 'hydration' | 'anti-aging' | 'brightening' | 'sensitive';
  sizes: string[];
  skinType?: string[];
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Vitamin C Face Wash',
    description: 'Brightening gel cleanser with natural extracts',
    price: 349,
    image: 'https://images.unsplash.com/photo-1745564989523-4aedb703f5c0?w=1080&q=80',
    category: 'brightening',
    sizes: ['100ml', '200ml'],
    skinType: ['All Skin Types', 'Dull Skin']
  },
  {
    id: '2',
    name: 'Niacinamide Serum',
    description: '10% Niacinamide for pore refinement',
    price: 599,
    image: 'https://images.unsplash.com/photo-1773187973415-2c85a99aaa82?w=1080&q=80',
    category: 'acne',
    sizes: ['30ml', '50ml'],
    skinType: ['Oily', 'Combination', 'Acne-Prone']
  },
  {
    id: '3',
    name: 'Hyaluronic Acid Moisturizer',
    description: 'Deep hydration with ceramides',
    price: 449,
    image: 'https://images.unsplash.com/photo-1696894756334-85d93f82e77c?w=1080&q=80',
    category: 'hydration',
    sizes: ['50ml', '100ml'],
    skinType: ['Dry', 'Normal', 'Dehydrated']
  },
  {
    id: '4',
    name: 'Retinol Night Serum',
    description: 'Anti-aging formula with 0.3% retinol',
    price: 799,
    image: 'https://images.unsplash.com/photo-1741896135518-ce303a539bc0?w=1080&q=80',
    category: 'anti-aging',
    sizes: ['30ml'],
    skinType: ['Mature Skin', 'All Skin Types']
  },
  {
    id: '5',
    name: 'Tea Tree Face Wash',
    description: 'Oil control with salicylic acid',
    price: 299,
    image: 'https://images.unsplash.com/photo-1739980129988-a7529a82a34f?w=1080&q=80',
    category: 'acne',
    sizes: ['100ml', '200ml'],
    skinType: ['Oily', 'Acne-Prone']
  },
  {
    id: '6',
    name: 'Kojic Acid Face Serum',
    description: 'Reduces pigmentation and dark spots',
    price: 549,
    image: 'https://images.unsplash.com/photo-1764694071462-db50e50a3925?w=1080&q=80',
    category: 'brightening',
    sizes: ['30ml', '50ml'],
    skinType: ['All Skin Types', 'Pigmented Skin']
  },
  {
    id: '7',
    name: 'Gentle Micellar Water',
    description: 'Alcohol-free makeup remover',
    price: 399,
    image: 'https://images.unsplash.com/photo-1752134593973-ac72a80ba7c7?w=1080&q=80',
    category: 'sensitive',
    sizes: ['100ml', '200ml', '400ml'],
    skinType: ['Sensitive', 'All Skin Types']
  },
  {
    id: '8',
    name: 'Peptide Eye Cream',
    description: 'Reduces dark circles and puffiness',
    price: 649,
    image: 'https://images.unsplash.com/photo-1768483018807-bd0b9ab86539?w=1080&q=80',
    category: 'anti-aging',
    sizes: ['15ml', '30ml'],
    skinType: ['All Skin Types', 'Mature Skin']
  },
  {
    id: '9',
    name: 'Aloe Vera Gel',
    description: '99% pure aloe vera for soothing',
    price: 249,
    image: 'https://images.unsplash.com/photo-1696894756316-c18f512cf783?w=1080&q=80',
    category: 'sensitive',
    sizes: ['100ml', '200ml'],
    skinType: ['Sensitive', 'All Skin Types']
  },
  {
    id: '10',
    name: 'SPF 50 Sunscreen',
    description: 'Broad spectrum UV protection',
    price: 499,
    image: 'https://images.unsplash.com/photo-1773000129212-3546d5e083cd?w=1080&q=80',
    category: 'brightening',
    sizes: ['50ml', '100ml'],
    skinType: ['All Skin Types']
  }
];
