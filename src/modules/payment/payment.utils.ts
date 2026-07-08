import axios from "axios";
import config from "../../config";

const SSL_BASE_URL = config.SSLCOMMERZ_IS_LIVE
  ? "https://securepay.sslcommerz.com"
  : "https://sandbox.sslcommerz.com";

const initiatePayment = async (paymentData: {
  amount: number;
  transactionId: string;
  customerName: string;
  customerEmail: string;
}) => {
  const data = {
    store_id: config.SSL_COMMERZ_STORE_ID,
    store_passwd: config.SSL_COMMERZ_STORE_PASSWORD,
    total_amount: paymentData.amount,
    currency: "BDT",
    tran_id: paymentData.transactionId,
    success_url: config.SSLCOMMERZ_SUCCESS_URL,
    fail_url: config.SSLCOMMERZ_FAIL_URL,
    cancel_url: config.SSLCOMMERZ_CANCEL_URL,
    cus_name: paymentData.customerName,
    cus_email: paymentData.customerEmail,
    cus_add1: "N/A",
    cus_city: "N/A",
    cus_postcode: "N/A",
    cus_country: "Bangladesh",
    cus_phone: "N/A",
    shipping_method: "NO",
    product_name: "Gear Rental",
    product_category: "Rental",
    product_profile: "general",
  };

  const response = await axios({
    method: "POST",
    url: `${SSL_BASE_URL}/gwprocess/v4/api.php`,
    data,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return response.data;
};

const validatePayment = async (val_id: string) => {
  const response = await axios.get(
    `${SSL_BASE_URL}/validator/api/validationserverAPI.php`,
    {
      params: {
        val_id,
        store_id: config.SSL_COMMERZ_STORE_ID,
        store_passwd: config.SSL_COMMERZ_STORE_PASSWORD,
        format: "json",
      },
    },
  );

  return response.data;
};

export const sslcommerzUtils = {
  initiatePayment,
  validatePayment,
};
