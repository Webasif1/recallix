import React from 'react'
import { Trash2, ExternalLink } from 'lucide-react';

const Card = ({collectionItems}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collectionItems.map(item => (
            <div key={item._id} className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 hover:border-[#F45B26]/30 transition-all duration-300 group relative">
              {/* Delete button */}
              <button
                onClick={() => handleDelete(item._id, item.title)}
                className="absolute bottom-3 right-3 opacity-100 transition-opacity p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 z-10"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <h3 className="font-semibold text-white line-clamp-2 pr-6">{item.title}</h3>
              <p className="text-sm text-gray-300 mt-2 line-clamp-3">{item.summary}</p>

              {/* Tags and View button row */}
              <div className="flex justify-between items-center mt-3">
                <div className="flex flex-wrap gap-2">
                  {item.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-300">#{tag}</span>
                  ))}
                </div>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-400 hover:text-[#F45B26] transition-colors rounded-md hover:bg-gray-800 absolute top-3 right-3"
                    title="Open original"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
          {collectionItems.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">No items in this collection.</div>
          )}
        </div>
  )
}

export default Card
