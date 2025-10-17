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
  const num = parseFloat(value);
  if (isNaN(num) || !isFinite(num)) {
    return '0.0%';
  }
  return `${num.toFixed(1)}%`;
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
  // Ensure all inputs are valid numbers
  const purchase = parseFloat(purchasePrice) || 0;
  const selling = parseFloat(sellingPrice) || 0;
  const costs = parseFloat(additionalCosts) || 0;
  
  // Check for valid inputs
  if (purchase <= 0 || selling <= 0) {
    return 0;
  }
  
  const totalInvestment = purchase + costs;
  
  // Avoid division by zero
  if (totalInvestment <= 0) {
    return 0;
  }
  
  const profit = selling - totalInvestment;
  return (profit / totalInvestment) * 100;
}

// Calculate profit
export const calculateProfit = (purchasePrice, sellingPrice, additionalCosts = 0) => {
  return sellingPrice - purchasePrice - additionalCosts
}