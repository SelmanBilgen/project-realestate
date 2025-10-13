import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

const Filters = ({ onFilterChange, areas = [] }) => {
  const [filters, setFilters] = useState({
    area: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    goldenVisa: '',
  })

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters = {
      area: '',
      status: '',
      minPrice: '',
      maxPrice: '',
      goldenVisa: '',
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg">Filter Properties</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Area Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Area
            </label>
            <Select 
              value={filters.area} 
              onValueChange={(value) => handleFilterChange('area', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Areas</SelectItem>
                {areas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Status
            </label>
            <Select 
              value={filters.status} 
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Min Price Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Min Price (€)
            </label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
          </div>

          {/* Max Price Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Max Price (€)
            </label>
            <Input
              type="number"
              placeholder="1000000"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
          </div>

          {/* Golden Visa Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Golden Visa
            </label>
            <Select 
              value={filters.goldenVisa} 
              onValueChange={(value) => handleFilterChange('goldenVisa', value === 'true')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default Filters