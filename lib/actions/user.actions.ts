"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { parseStringify } from "../utils";


const getUserByEmail = async ( email: string) => {
    const { database } = await createAdminClient();

    const result = await database.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.equal("email", [email])],
    );

    return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error: unknown, message: string) => {
    console.log(error, message);
    throw error;
};

const sendEmailOTP = async ({ email } : { email: string}) => {
    const { account } = await createAdminClient();
    try {
        const session = await account.createEmailToken(ID.unique(), email);

        return session.userId;
    } catch (error) {
        handleError(error, "Failed to send email OTP");
    }
};

export const creatAccount = async ({ 
    fullName,
    email, 
    password } : {
        fullName: string;
        email: string;
        password: string;
    }) => {
    const existingUser = await getUserByEmail(email);

    const accountId = await sendEmailOTP({ email});
    if(!accountId) throw new Error("Failed to send OTP");

    if(!existingUser) {
        const { database } = await createAdminClient();

        await database.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                email,
                fullName,
                password,
                accountId,
                avatar: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEA8ODxAPDhEODQ0NDw8ODw8PDw4QFREWFhUSExMYHSggGBolGxMTITEhJSkrLi4uFx8zODMsNygtLisBCgoKBQUFDgUFDisZExkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAOEA4QMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAAAwQBAgUGB//EADMQAQACAQEGAwcCBgMAAAAAAAABAgMRBAUhMVFxEkGRIjJhgaGxwVLhQnKSstHwI4Ki/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/APuIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAxMseOOsA2GvjjrDMSDIAAAAAAAAAAAAAAAAAAAAADFrRHNFfL09UUyCW2bp9Uc3nq1AAAAAbReeqSubr9EIC1W8TybKaWmXqCcYiWQAAAAAAAAAAAAAJBiZV8mTXsZL69mgAAAAAAAAAAAANqX0Wa21VG1LaAtDETrxZAAAAAAAAAAAQ5r+XqltbSNVWZBgAAABply1pGtp0+89mcl4rE2nlEauJtGab21n5R0gFjPvG0+77Mesqtstp52tPeZagNq5LRytaO0ysYd4Xrz9qPjz9VUB3cGet41rPePOEjgYsk1mLRwmP8AdHb2fNF6xaPnHSegJAAAAS4b+XVOprOO2sA3AAAAAAAAABDnnlHzQtsk6zLUAAAAHO3rl92n/afw56xvGf8Akt8IrH0VwAAAAFzdeXS3h8rR9YU0myzpen81fuDugAAAJcE8dOqJmJ04gtgAAAAAAAMSy1vynsCqAAAAADkbzrpkmesRP4/Cq6u88OtYtHOvP+VygAAAAE2x11yUj46+nFC6G6sPPJPav5kHRAAAAABaxzwjs2aYeUNwAAAAAAGt+U9mzEgqAAAAAAOTtuxzXW1eNf7f2dYB54dbPu+luMezPw5eirbdt/Kaz85gFMXK7tv5zWPnM/hYw7urHG0+L4coBT2TZZvPSsc56/CHYrWIiIjhERpDMRpwjgAAAAAAAs4eUN2uOOEdmwAAAAAAAAKt40me7VNnjlPyQgAAAADTLlrSNbTp957Odm3jaeFI8MdZ4z+wOojnPSOd6/1Q4l8k296ZnvLUHdjaKT/HT+qEkTry49nnma2mOUzHadAegHJw7wvHve1HpPq6ODaK3j2Z7xPOASgAAAMxDCTDXj2BYgAAAAAAAAAGt66xoqriDNXzBEAAg2vaYxx1tPKPzKTPlilZtPl9ZcPLkm0zaec/7oBkyTadbTrLUAAAAAGa2mJ1iZiY84YAdfYtr8fCeFo9J+MLTz1bTExMcJjjEu3smfx11844Wj4gmAAWcVdI78UWKms9lgAAAAAAAAAABiYZAVb00ardq6q166cwcnemXW0U8q8Z7ypNsl/FM26zMtQAAAAAAAAFnd+Xw3jpb2Z/CsA9CzWuvBrs8+OKzHnET2W6U0BmtdI0ZAAAAAAAAAAAAABi9YmJieUxpLIDhbZuu1dZpravT+KP8ue9arbTsNMnGY0n9VeE/uDzY6GfdN6+7pePSVHJitX3qzXvEwDUAAAAZpSbcKxM9omV3BurJb3tKR8eM+kAorux7tvfjPsV6zzntDqbNu7HTjp4p62/ELgNMOKKViteUcIbgAAAAAAAAAAAAAAAAAAAxMMgIL7HjnnSvpEfZFO7MP6fS1v8rgCnG7MP6f8A1ZJTYsUcqV+ca/dYAYrWI4RGnbgyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/Z"
            },
        );
    }

    return parseStringify({ accountId });
};