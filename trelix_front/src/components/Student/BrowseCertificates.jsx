import { useEffect, useState } from "react";
import { Eye, Download, X, Award } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";

const BrowseCertificates = () => {
  const navigate = useNavigate();
  const { certificates, loading } = useOutletContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const itemsPerPage = 9;

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCertificates = certificates.slice(indexOfFirstItem, indexOfLastItem);
  const baseUrl = "http://localhost:5000";

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Section */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '2rem',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '1rem'
      }}>
        <Award style={{ color: '#4f46e5', marginRight: '1rem', width: '2rem', height: '2rem' }} />
        <h1 style={{ 
          fontSize: '1.875rem', 
          fontWeight: '700', 
          color: '#1f2937',
          margin: 0
        }}>
          My Certificates
        </h1>
      </div>

      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh'
        }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '4px solid #e5e7eb',
            borderTopColor: '#4f46e5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      ) : (
        <>
          {/* Certificate Grid */}
          <div style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns: selectedPdf ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))'
          }}>
            {currentCertificates.map((cert) => (
              <div 
                key={cert.id}
                style={{ 
                  display: selectedPdf ? 'none' : 'block',
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  ':hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '1rem'
                  }}>
                    <img 
                      src={cert.logo} 
                      alt={cert.issuer} 
                      style={{ 
                        width: '3rem', 
                        height: '3rem', 
                        objectFit: 'contain',
                        marginRight: '1rem'
                      }} 
                    />
                    <div>
                      <h3 style={{ 
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: 0
                      }}>
                        {cert.name}
                      </h3>
                      <p style={{ 
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        margin: '0.25rem 0 0 0'
                      }}>
                        Issued by: {cert.issuer}
                      </p>
                    </div>
                  </div>
                  
                  <p style={{ 
                    fontSize: '0.875rem',
                    color: '#4b5563',
                    marginBottom: '1.5rem'
                  }}>
                    {cert.description}
                  </p>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {cert.isOwned ? (
                      <>
                        <button
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            width: 'auto',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.375rem',
                            backgroundColor: '#e0e7ff',
                            color: '#4f46e5',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c7d2fe'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e0e7ff'}
                          onClick={() => setSelectedPdf(`${baseUrl}${cert.pdfUrl.replace(/\\/g, "/")}`)}
                        >
                          <Eye style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                          Preview
                        </button>
                        <button
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            width: 'auto',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.375rem',
                            backgroundColor: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                          onClick={() => window.open(`${baseUrl}${cert.pdfUrl.replace(/\\/g, "/")}`, '_blank')}
                        >
                          <Download style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                          Download
                        </button>
                      </>
                    ) : (
                      <button
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.375rem',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          transition: 'all 0.2s ease',
                          width: '100%',
                          justifyContent: 'center'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                        onClick={() => navigate(`/chapters/${cert.courseSlug}`)}
                      >
                        Complete Course to Earn Certificate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PDF Preview Section */}
          {selectedPdf && (
            <div style={{ marginTop: '2rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <h2 style={{ 
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  Certificate Preview
                </h2>
                <button
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onClick={() => setSelectedPdf(null)}
                >
                  <X style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                  Close Preview
                </button>
              </div>
              <div style={{ 
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                height: '70vh'
              }}>
                <iframe
                  src={selectedPdf}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                ></iframe>
              </div>
            </div>
          )}

          {/* Pagination */}
          {certificates.length > itemsPerPage && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginTop: '2rem'
            }}>
              <div style={{ 
                display: 'flex',
                gap: '0.5rem'
              }}>
                {Array.from({ length: Math.ceil(certificates.length / itemsPerPage) }).map((_, index) => (
                  <button
                    key={index}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.375rem',
                      backgroundColor: currentPage === index + 1 ? '#4f46e5' : 'white',
                      color: currentPage === index + 1 ? 'white' : '#4f46e5',
                      border: currentPage === index + 1 ? 'none' : '1px solid #4f46e5',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BrowseCertificates;