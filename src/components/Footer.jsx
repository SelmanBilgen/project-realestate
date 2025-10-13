import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rigel Premium Homes
            </h3>
            <p className="text-gray-600 mb-4">
              Your trusted partner for premium real estate investments in Greece. 
              Specializing in Golden Visa eligible properties with exceptional ROI.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>📧 info@rigelhomes.com</p>
              <p>📞 +30 210 123 4567</p>
              <p>📍 Athens, Greece</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/projects" className="text-gray-600 hover:text-primary transition-colors">
                  All Projects
                </Link>
              </li>
              <li>
                <Link to="/premium" className="text-gray-600 hover:text-primary transition-colors">
                  Premium Access
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-gray-600 hover:text-primary transition-colors">
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Golden Visa
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Minimum investment: €250,000</li>
              <li>• 5-year residency permit</li>
              <li>• Family inclusion</li>
              <li>• EU travel freedom</li>
              <li>• Path to citizenship</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            © 2024 Rigel Premium Homes. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer