import { useState } from "react";
import { FuelContext } from "./FuelContext";
export const FuelProvider = ({ children }) => {
  const [fuelType, setFuelType] = useState("regular"); // state for changing the fuel type

  return (
    <FuelContext.Provider value={{ fuelType, setFuelType }}>
      {children}
    </FuelContext.Provider>
  );
};


// provider is a component that disperse the data to other components