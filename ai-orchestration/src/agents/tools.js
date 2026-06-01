import axios from "axios";
import { tool } from "langchain";
import * as z from "zod";

const BASE_URL =
  "http://019e8357-b1a7-731f-b406-c07cdab25d91.agent.localhost";

export const listFiles = tool(
  async () => {
    try {
      console.log("==========================");
      console.log("listFiles");
      console.log("==========================");

      const response = await axios.get(`${BASE_URL}/list-files`);

      console.log("==========================");
      console.log(JSON.stringify(response.data.files, null, 2));
      console.log("==========================");

      return response.data.files;
    } catch (error) {
      return `Failed to list files: ${error.message}`;
    }
  },
  {
    name: "list-files",
    description: "Useful when you want to list files in a directory",
    inputSchema: z.object({}),
  }
);

export const readFile = tool(
  async ({ files }) => {
    try {
      console.log("==========================");
      console.log("readFiles");
      console.log("==========================");

      const response = await axios.get(`${BASE_URL}/read-files`, {
        params: {
          files: files.join(","),
        },
      });

      console.log("==========================");
      console.log(JSON.stringify(response.data, null, 2));
      console.log("==========================");

      return response.data;
    } catch (error) {
      return `Failed to read files: ${error.message}`;
    }
  },
  {
    name: "read-files",
    description: "Useful when you want to read the content of one or more files",
    inputSchema: z.object({
      files: z.array(z.string()).min(1).describe("List of files to read"),
    }),
  }
);

export const updateFiles = tool(
  async ({ updates }) => {
    try {
      console.log("==========================");
      console.log("updateFiles");
      console.log("==========================");

      const response = await axios.patch(
        `${BASE_URL}/update-files`,
        {
          updates,
        }
      );

      console.log("==========================");
      console.log(JSON.stringify(response.data, null, 2));
      console.log("==========================");

      return response.data;
    } catch (error) {
      return `Failed to update files: ${error.message}`;
    }
  },
  {
    name: "update-files",
    description: "Useful when you want to update one or more files",
    inputSchema: z.object({
      updates: z
        .array(
          z.object({
            file: z.string().describe("Path of the file"),
            content: z.string().describe("New file content"),
          })
        )
        .min(1),
    }),
  }
);