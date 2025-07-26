import React from 'react'
import { ProductGrid } from '../components/Products/ProductGrid'

export function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Our Products
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Explore our complete collection of premium products designed to enhance your lifestyle
          </p>
        </div>
      </div>
      <ProductGrid />
    </div>
  )
}