import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { 
  Upload, 
  X, 
  Edit3, 
  Image as ImageIcon, 
  Tag,
  Move,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';

const ImageUpload = ({ images = [], onChange, maxImages = 10 }) => {
  const fileInputRef = useRef(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempTag, setTempTag] = useState('');

  // Handle file selection
  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;
    const filesToProcess = fileArray.slice(0, remainingSlots);

    Promise.all(
      filesToProcess.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              id: Date.now() + Math.random(),
              file: file,
              url: e.target.result,
              tag: '',
              name: file.name,
              size: file.size,
              type: file.type
            });
          };
          reader.readAsDataURL(file);
        });
      })
    ).then(newImages => {
      onChange([...images, ...newImages]);
    });
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  // Update image tag
  const updateImageTag = (index, tag) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], tag };
    onChange(newImages);
  };

  // Move image position
  const moveImage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onChange(newImages);
  };

  // Handle drag and drop reordering
  const handleImageDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleImageDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleImageDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveImage(draggedIndex, index);
      setDraggedIndex(null);
    }
  };

  const startEditingTag = (index) => {
    setEditingIndex(index);
    setTempTag(images[index]?.tag || '');
  };

  const saveTag = () => {
    if (editingIndex !== null) {
      updateImageTag(editingIndex, tempTag);
      setEditingIndex(null);
      setTempTag('');
    }
  };

  const cancelEditingTag = () => {
    setEditingIndex(null);
    setTempTag('');
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">Property Images</Label>
        <p className="text-sm text-gray-600 mt-1">
          Upload up to {maxImages} images. Drag and drop to reorder. Add custom tags to images.
        </p>
      </div>

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              Drop images here or click to upload
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG, WEBP up to 10MB each
            </p>
          </div>
          <Button type="button" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Choose Files
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Uploaded Images ({images.length}/{maxImages})</h4>
            <p className="text-sm text-gray-500">Drag to reorder • First image will be the main photo</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <Card 
                key={image.id} 
                className={`relative group cursor-move transition-all ${
                  index === 0 ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
                draggable
                onDragStart={(e) => handleImageDragStart(e, index)}
                onDragOver={(e) => handleImageDragOver(e, index)}
                onDrop={(e) => handleImageDrop(e, index)}
              >
                <CardContent className="p-2">
                  {/* Image */}
                  <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={image.url}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Main Image Badge */}
                    {index === 0 && (
                      <div className="absolute top-1 left-1 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-sm">
                        Main
                      </div>
                    )}

                    {/* Custom Tag */}
                    {image.tag && (
                      <div className="absolute top-8 left-1 bg-black/90 text-white px-2 py-1 rounded-md text-xs font-medium max-w-[90px] truncate shadow-sm">
                        {image.tag}
                      </div>
                    )}

                    {/* Controls - Always Visible */}
                    <div className="absolute top-1 right-1 flex space-x-1">
                      {/* Edit Tag */}
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="w-8 h-8 p-0 bg-white/90 hover:bg-white shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingTag(index);
                        }}
                        title="Add/Edit Tag"
                      >
                        <Tag className="w-4 h-4" />
                      </Button>

                      {/* Remove */}
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="w-8 h-8 p-0 bg-red-500 hover:bg-red-600 shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        title="Delete Image"
                      >
                        <X className="w-4 h-4 text-white" />
                      </Button>
                    </div>

                    {/* Move Controls - Show on Hover at Bottom */}
                    <div className="absolute bottom-1 left-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center space-x-2">
                      {/* Move Left */}
                      {index > 0 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="w-8 h-8 p-0 bg-white/90 hover:bg-white shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveImage(index, index - 1);
                          }}
                          title="Move Left"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </Button>
                      )}

                      {/* Move Right */}
                      {index < images.length - 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="w-8 h-8 p-0 bg-white/90 hover:bg-white shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveImage(index, index + 1);
                          }}
                          title="Move Right"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Image Info */}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500 truncate">{image.name}</p>
                    <p className="text-xs text-gray-400">
                      {(image.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tag Editing Modal */}
      {editingIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Tag className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Add Custom Tag</h3>
                </div>
                
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={images[editingIndex]?.url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <Label htmlFor="imageTag">Custom Tag (optional)</Label>
                  <Input
                    id="imageTag"
                    value={tempTag}
                    onChange={(e) => setTempTag(e.target.value)}
                    placeholder="e.g., Living Room, Kitchen, Balcony..."
                    maxLength={20}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This tag will appear on the image in the gallery
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button onClick={saveTag} className="flex-1">
                    Save Tag
                  </Button>
                  <Button onClick={cancelEditingTag} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Instructions */}
      {images.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <ImageIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-blue-900">Image Management Tips:</p>
              <ul className="text-blue-800 space-y-1">
                <li>• First image will be used as the main property photo</li>
                <li>• Drag and drop images to reorder them</li>
                <li>• Click the tag icon to add custom labels</li>
                <li>• Use descriptive tags like "Living Room", "Kitchen", "View"</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;