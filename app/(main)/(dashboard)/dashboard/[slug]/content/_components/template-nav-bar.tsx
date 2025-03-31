const tabs = [
  "Sale",
  "New",
  "Women",
  "Men",
  "Beauty",
  "Shoes",
  "Accessories",
  "Kids",
  "Designer",
  "Home",
  "Gifts",
  "Explore",
];

export const TemplateNavBar = () => {
  return (
    <div className="flex justify-between items-center p-4 px-8 mx-4">
      {tabs.map((tab, index) => (
        <span className="first-of-type:text-red-500" key={index}>
          {tab}
        </span>
      ))}
    </div>
  );
};
