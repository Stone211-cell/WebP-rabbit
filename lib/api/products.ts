import axios from 'axios';

export interface Product {
    id: string;
    code: string;
    name: string;
    category?: string | null;
    price: number;
    unit?: string | null;
    description?: string | null;
    image?: string | null;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const API_URL = '/api/products';

// Fetch all products with optional search
export const getProducts = async (search: string = ''): Promise<Product[]> => {
    try {
        const response = await axios.get(API_URL, {
            params: { search },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

// Create a new product
export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
    try {
        const response = await axios.post(API_URL, productData);
        return response.data;
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
};
