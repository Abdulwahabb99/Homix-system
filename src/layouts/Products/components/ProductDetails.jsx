import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function ProductDetails() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const [isLoading, setIsLoading] = useState(true);
  const [productDetails, setProductDetails] = useState(null);
  axios.interceptors.request.use(
    (config) => {
      if (user.token) {
        config.headers["Authorization"] = `Bearer ${user.token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const getProductDetails = async () => {
      setIsLoading(true);
      try {
        const { data: data } = await axios.get(`https://homix.onrender.com/products/${id}`);
        console.log(data);
        setProductDetails(data.data);
        //   setOrderStatus(data.data.status);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getProductDetails();
  }, []);

  return <div>ProductDetails</div>;
}

export default ProductDetails;
