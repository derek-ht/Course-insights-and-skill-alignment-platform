export const GridContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,_minmax(15rem,_1fr))] gap-[2rem] mb-8">
      {children}
    </div>
  );
};
