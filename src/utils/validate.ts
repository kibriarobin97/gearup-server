export const validateRegister = (payload: any) => {
  const { email, password, role } = payload;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return "Invalid email format.";
  }
  
  if (!password || password.length < 6) {
    return "Password must be at least 6 characters long.";
  }

  if (role) {
    if (role === "ADMIN") {
      return "Registration as ADMIN is not allowed.";
    }
    if (role !== "CUSTOMER" && role !== "PROVIDER") {
      return "Invalid role. Role must be either CUSTOMER or PROVIDER.";
    }
  }

  return null;
};

export const validateLogin = (payload: any) => {
  const { email, password } = payload;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return "Invalid email format.";
  }

  if (!password) {
    return "Password is required.";
  }

  return null;
};

export const validateGear = (payload: any) => {
  const { name, description, pricePerDay, categoryId } = payload;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return "Gear name is required";
  }
  if (!description || typeof description !== "string") {
    return "Gear description is required";
  }
  if (!pricePerDay || typeof pricePerDay !== "number" || pricePerDay <= 0) {
    return "Price per day must be a positive number";
  }
  if (!categoryId || typeof categoryId !== "string") {
    return "Category ID is required";
  }

  return null;
};

export const validateRentalOrder = (payload: any) => {
  const { gearId, startTime, endTime, quantity } = payload;

  if (!gearId || typeof gearId !== "string") {
    return "Gear ID is required";
  }
  if (!startTime || isNaN(Date.parse(startTime))) {
    return "Valid start time is required";
  }
  if (!endTime || isNaN(Date.parse(endTime))) {
    return "Valid end time is required";
  }
  if (!quantity || typeof quantity !== "number" || quantity <= 0) {
    return "Quantity must be a positive number";
  }

  return null;
};

export const validateReview = (payload: any) => {
  const { gearId } = payload;

  if (!gearId || typeof gearId !== "string") {
    return "Gear ID is required";
  }

  return null;
};

export const validateCategory = (payload: any) => {
  const { name } = payload;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return "Category name is required";
  }

  return null;
};