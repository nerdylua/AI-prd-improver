import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prdContent } = req.body;

  if (!prdContent) {
    return res.status(400).json({ error: 'Missing PRD content' });
  }

  try {
    // Here you would typically save to your database
    // For now, we'll just return success
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save PRD' });
  }
} 