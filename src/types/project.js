// Project Type Definitions
export const projectStatus = {
  AVAILABLE: 'available',
  SOLD: 'sold',
  RESERVED: 'reserved'
}

export const projectSchema = {
  id: 'uuid',
  title: 'text',
  area: 'text',
  price: 'numeric',
  size: 'numeric',
  bedrooms: 'int',
  bathrooms: 'int',
  status: 'text',
  golden_visa: 'boolean',
  completion_year: 'int',
  image_url: 'text',
  description: 'text',
  purchase_price: 'numeric',
  transfer_fees: 'numeric',
  renovation_cost: 'numeric',
  selling_price: 'numeric',
  roi: 'numeric',
  created_at: 'timestamp'
}