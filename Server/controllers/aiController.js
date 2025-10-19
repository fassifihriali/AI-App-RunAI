import sql from "../configs/db.js"
import OpenAI from "openai"
import { clerkClient } from "@clerk/express"
import axios from "axios"
import {v2 as cloudinary} from 'cloudinary'
import FormData from 'form-data'
import fs from 'fs'
import 'dotenv/config';



const AI = new OpenAI({
    apiKey : process.env.GEMINI_API_KEY,
    baseURL : "https://generativelanguage.googleapis.com/v1beta/openai/"
})

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({ success: false, message: "Limit reached. Upgrade to continue." });
    }

    const { data } = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!content) {
      console.error("Gemini returned no content:", data);
      return res.json({ success: false, message: "No content generated from AI." });
    }

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'article')
    `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({ success: false, message: "Limit reached. Upgrade to continue." });
    }

    const { data } = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!content) {
      console.error("Gemini returned no content:", data);
      return res.json({ success: false, message: "No content generated from AI." });
    }

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
    `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions.",
      });
    }

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      size: "1024x1024", 
    });

    const base64Image = response.data[0].b64_json;
    if (!base64Image) {
      return res.json({ success: false, message: "No image generated from AI." });
    }

    const imageDataUri = `data:image/png;base64,${base64Image}`;

    const uploadResult = await cloudinary.uploader.upload(imageDataUri);
    const secure_url = uploadResult.secure_url;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish)
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
    `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error("OpenAI image generation error:", error.response?.data || error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageBackground = async (req,res)=>{
    try {
        const {userId} = req.auth()
        const image = req.file
        const plan = req.plan
        if (plan !== 'premium') {
            return res.json({success:false, message:'This feature is only availble for premium subscriptions.'})
        }
        const {secure_url} = await cloudinary.uploader.upload(image.path, {
            transformation : [
                {
                    effect: 'background_removal',
                    background_removal: 'remove_the_background'   
                }
            ]
        })
        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')`
        res.json({success: true, content: secure_url})

    } catch (error) {
        console.log(error.message);
        res.json({success:false, message:error.message})
    }
}

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const image = req.file;
    const plan = req.plan;

    if (plan !== 'premium') {
      return res.json({ success: false, message: 'This feature is only available for premium subscriptions.' });
    }

    if (!image) {
      return res.json({ success: false, message: 'No image uploaded.' });
    }

    if (!object || object.split(' ').length > 1) {
      return res.json({ success: false, message: 'Object name must be a single word.' });
    }

    const uploadResult = await cloudinary.uploader.upload(image.path, {
      transformation: [
        { effect: `gen_remove:${object}` }
      ]
    });
    const imageUrl = uploadResult.secure_url;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${`Remove ${object} from image`}, ${imageUrl}, 'image')
    `;

    res.json({ success: true, content: imageUrl });

  } catch (error) {
    console.error("Remove Object error:", error.message);
    res.json({ success: false, message: error.message });
  }
};


import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions.",
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume file size exceeds allowed size (5MB).",
      });
    }

    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);

    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement.\n\n${pdfData.text}`;

    const response = await AI.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')
    `;

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
