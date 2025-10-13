// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format number with commas
export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US').format(number)
}

// Format percentage
export const formatPercentage = (value) => {
  return `${value.toFixed(1)}%`
}

// Format date
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Calculate ROI
export const calculateROI = (purchasePrice, sellingPrice, additionalCosts = 0) => {
  const totalInvestment = purchasePrice + additionalCosts
  const profit = sellingPrice - totalInvestment
  return (profit / totalInvestment) * 100
}

// Calculate profit
export const calculateProfit = (purchasePrice, sellingPrice, additionalCosts = 0) => {
  return sellingPrice - purchasePrice - additionalCosts
}