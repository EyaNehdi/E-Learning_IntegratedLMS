const MaterialItem = ({ material }) => {
                      // Fonction pour obtenir l'icône du matériel
                      const getMaterialIcon = (material) => {
                        if (!material) return "📄"
                    
                        if (material.driveFile) {
                          const fileName = material.driveFile.driveFile.title || material.driveFile.driveFile.name || ""
                          const fileExtension = fileName.split(".").pop().toLowerCase()
                    
                          if (fileExtension === "pdf") return "📕"
                          if (["doc", "docx"].includes(fileExtension)) return "📘"
                          if (["xls", "xlsx"].includes(fileExtension)) return "📗"
                          if (["ppt", "pptx"].includes(fileExtension)) return "📙"
                          if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) return "🖼️"
                          return "📄"
                        }
                        if (material.youtubeVideo) return "🎬"
                        if (material.link) return "🔗"
                        if (material.form) return "📝"
                        return "📄"
                      }
                    
                      // Fonction pour obtenir le lien du matériel
                      const getMaterialLink = (material) => {
                        if (!material) return "#"
                    
                        if (material.driveFile) {
                          // Utiliser webViewLink ou webContentLink si disponible, sinon utiliser alternateLink
                          return (
                            material.driveFile.driveFile.webViewLink ||
                            material.driveFile.driveFile.webContentLink ||
                            material.driveFile.driveFile.alternateLink ||
                            "#"
                          )
                        }
                        if (material.youtubeVideo) return `https://www.youtube.com/watch?v=${material.youtubeVideo.id}`
                        if (material.link) return material.link.url
                        if (material.form) return material.form.formUrl
                        return "#"
                      }
                    
                      // Fonction pour obtenir le titre du matériel
                      const getMaterialTitle = (material) => {
                        if (!material) return "Document"
                    
                        if (material.driveFile) {
                          return material.driveFile.driveFile.title || material.driveFile.driveFile.name || "Document"
                        }
                        if (material.youtubeVideo) return material.youtubeVideo.title
                        if (material.link) return material.link.title || material.link.url
                        if (material.form) return material.form.title
                        return "Document"
                      }
                    
                      // Fonction pour obtenir le type MIME du matériel
                      const getMaterialType = (material) => {
                        if (!material) return ""
                    
                        if (material.driveFile && material.driveFile.driveFile.mimeType) {
                          return material.driveFile.driveFile.mimeType
                        }
                        return ""
                      }
                    
                      // Fonction pour obtenir la vignette du matériel
                      const getMaterialThumbnail = (material) => {
                        if (!material) return null
                    
                        if (material.driveFile && material.driveFile.driveFile.thumbnailLink) {
                          return material.driveFile.driveFile.thumbnailLink
                        }
                        return null
                      }
                    
                      return (
                        <li className="flex items-start p-2 border rounded-md hover:bg-gray-50">
                          <span className="mr-2 text-xl">{getMaterialIcon(material)}</span>
                          <div className="flex-1">
                            <a
                              href={getMaterialLink(material)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline font-medium"
                            >
                              {getMaterialTitle(material)}
                            </a>
                            <p className="text-xs text-gray-500">{getMaterialType(material)}</p>
                    
                            {/* Afficher la vignette pour les fichiers qui en ont une */}
                            {getMaterialThumbnail(material) && (
                              <div className="mt-2">
                                <img
                                  src={getMaterialThumbnail(material) || "/placeholder.svg"}
                                  alt={getMaterialTitle(material)}
                                  className="max-w-xs max-h-32 object-contain border rounded"
                                />
                              </div>
                            )}
                          </div>
                        </li>
                      )
                    }
                    
                    export default MaterialItem
                    