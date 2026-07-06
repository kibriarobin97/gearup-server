export const validateUser = (payload: any) => {
  const { name, email, password, role } = payload;

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