const PageContainer = ({ children }) => {
  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {children}
    </div>
  );
};

export default PageContainer;
