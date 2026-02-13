import admin from "../services/firebaseAdmin.js";
import pool from "../db/postgres.js";
import { sendInstructorInvite } from "../services/email.service.js";

export const getMyProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        user_id AS id,
        full_name AS "displayName",
        email,
        role,
        status,
        bio,
        "headline/college_name" AS headline,
        linkedin,
        github,
        photo_url AS "photoURL",
        created_at
      FROM users
      WHERE user_id = $1
      `,
      [req.user.id],
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("getMyProfile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { email } = req.query;
    let query = `SELECT user_id, full_name, email, role, status, created_at
                 FROM users`;
                //  WHERE role = 'student' AND status = 'active'`;
    let params = [];
    if (email) {
      query += ` AND email ILIKE $1`;
      params = [email];
    }
    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addInstructor = async (req, res) => {
  const { fullName, email, subject, phone, bio } = req.body;

  try {
    // 1️⃣ Check duplicate email
    const existing = await pool.query("SELECT 1 FROM users WHERE email = $1", [
      email,
    ]);

    if (existing.rows.length > 0) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    // 2️⃣ Create Firebase user
    const firebaseUser = await admin.auth().createUser({
      email,
      displayName: fullName,
    });

    // 3️⃣ Insert user
    const userResult = await pool.query(
      `INSERT INTO users (firebase_uid, full_name, email, role, status)
       VALUES ($1, $2, $3, 'instructor', 'active')
       RETURNING user_id`,
      [firebaseUser.uid, fullName, email],
    );

    const instructorId = userResult.rows[0].user_id;

    // 4️⃣ Insert instructor profile
    await pool.query(
      `INSERT INTO instructor_profiles (instructor_id, subject, phone, bio)
       VALUES ($1, $2, $3, $4)`,
      [instructorId, subject, phone || null, bio || null],
    );

    // ✅ 5️⃣ SEND SUCCESS RESPONSE FIRST
    res.status(201).json({
      message: "Instructor created successfully",
    });

    // 🔵 6️⃣ SEND EMAIL (DO NOT BREAK API IF IT FAILS)
    try {
      await sendInstructorInvite(email, fullName);
    } catch (mailError) {
      console.error("SMTP failed:", mailError);
    }
  } catch (error) {
    console.error("addInstructor error:", error);
    res.status(500).json({ message: "Failed to create instructor" });
  }
};

export const updateUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users
       SET status = $1
       WHERE user_id = $2
       RETURNING user_id, status`,
      [status, userId],
    );

    res.status(200).json({
      message: "User status updated",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateMyProfile = async (req, res) => {
  const { displayName, bio, headline, linkedin, github, photoURL } = req.body;

  // Normalize headline: empty or whitespace-only to null
  const normalizedHeadline = headline && headline.trim() !== '' ? headline.trim() : null;

  try {
    // Get current profile data to preserve fields not being updated
    const currentProfile = await pool.query(
      `SELECT full_name, "headline/college_name" FROM users WHERE user_id = $1`,
      [req.user.id]
    );

    if (currentProfile.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const { full_name: currentFullName, "headline/college_name": currentHeadline } = currentProfile.rows[0];

    // Only update fields that have values, preserve existing data if empty
    const finalDisplayName = displayName && displayName.trim() !== '' ? displayName.trim() : currentFullName;
    const finalBio = bio !== undefined ? bio : null;
    const finalLinkedin = linkedin !== undefined ? linkedin : null;
    const finalGithub = github !== undefined ? github : null;
    const finalPhotoURL = photoURL !== undefined ? photoURL : null;

    // Update the profile
    await pool.query(
      `
      UPDATE users SET
        full_name = $1,
        bio = $2,
        "headline/college_name" = $3,
        linkedin = $4,
        github = $5,
        photo_url = $6,
        updated_at = NOW()
      WHERE user_id = $7
      `,
      [finalDisplayName, finalBio, normalizedHeadline, finalLinkedin, finalGithub, finalPhotoURL, req.user.id],
    );

    // If headline changed and user is student, create college group if it doesn't exist
    if (normalizedHeadline && normalizedHeadline !== currentHeadline && req.user.role === 'student') {
      // Normalize group name using same logic as createGroup: uppercase, trim, and regex normalize special chars
      const normalizedGroupName = normalizedHeadline
        .toUpperCase()
        .trim()
        .replace(/[,.\-_() ]+/g, ' ')
        .trim();
      
      await pool.query(
        `
        INSERT INTO groups (group_name, created_by, start_date, end_date)
        VALUES ($1, NULL, NULL, NULL)
        ON CONFLICT (group_name) DO NOTHING
        `,
        [normalizedGroupName]
      );
    }

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("updateMyProfile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
