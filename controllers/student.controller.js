import pool from "../db/postgres.js";

// ULTRA MINIMAL VERSION - Test Step by Step

export const getStudentDashboard = async (req, res) => {
  try {
    console.log('=== DASHBOARD DEBUG START ===');
    console.log('1. req.user:', JSON.stringify(req.user, null, 2));
    console.log('2. req.user.id:', req.user?.id);
    console.log('3. req.user.uid:', req.user?.uid);
    
    const studentId = req.user.id;
    
    if (!studentId) {
      console.log('❌ No student ID found!');
      return res.status(400).json({ 
        error: 'No student ID',
        user: req.user 
      });
    }

    console.log('4. About to query database for student:', studentId);

    // Simplest possible query
    const result = await pool.query(
      `SELECT user_id, name, email FROM users WHERE user_id = $1`,
      [studentId]
    );

    console.log('5. Query result:', result.rows);

    if (!result.rows || result.rows.length === 0) {
      console.log('❌ No user found in database');
      return res.status(404).json({ 
        error: 'User not found',
        studentId: studentId 
      });
    }

    console.log('✅ User found!');
    console.log('=== DASHBOARD DEBUG END ===');

    return res.json({
      success: true,
      user: result.rows[0],
      xp: 0,
      streak: 0,
      enrolled_count: 0,
      last_learning: null,
      recent_activity: [],
      deadlines: [],
      assignments_count: 0
    });

  } catch (err) {
    console.error('=== DASHBOARD ERROR ===');
    console.error('Error type:', err.constructor.name);
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    console.error('Error stack:', err.stack);
    console.error('=== END ERROR ===');
    
    return res.status(500).json({
      message: "Failed to load student dashboard",
      error: err.message,
      errorType: err.constructor.name,
      errorCode: err.code
    });
  }
};


export const searchCourses = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || !query.trim()) {
      return res.json([]);
    }

    const searchTerm = `%${query.trim()}%`;

    // Search courses and modules with course details
    const result = await pool.query(
      `SELECT * FROM (
        -- Search Courses
        SELECT 
          c.courses_id AS id,
          c.title,
          c.description,
          c.category,
          c.status,
          c.difficulty,
          c.thumbnail_url,
          c.validity_value,
          c.validity_unit,
          c.expires_at,
          c.created_at,
          c.instructor_id,
          u.full_name AS instructor_name,
          'course' AS type,
          NULL AS course_title
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.user_id
        WHERE c.status = 'approved'
          AND (LOWER(c.title) LIKE LOWER($1)
            OR LOWER(COALESCE(c.description, '')) LIKE LOWER($1)
            OR LOWER(COALESCE(c.category, '')) LIKE LOWER($1))
        
        UNION ALL
        
        -- Search Modules in approved courses
        SELECT 
          m.module_id AS id,
          m.title,
          c.description,
          c.category,
          c.status,
          c.difficulty,
          c.thumbnail_url,
          c.validity_value,
          c.validity_unit,
          c.expires_at,
          m.created_at,
          c.instructor_id,
          u.full_name AS instructor_name,
          'module' AS type,
          c.title AS course_title
        FROM modules m
        JOIN courses c ON m.course_id = c.courses_id
        LEFT JOIN users u ON c.instructor_id = u.user_id
        WHERE c.status = 'approved'
          AND (LOWER(m.title) LIKE LOWER($1)
            OR LOWER(COALESCE(m.notes, '')) LIKE LOWER($1))
      ) AS combined_results
      ORDER BY created_at DESC
      LIMIT 20`,
      [searchTerm]
    );

    res.json(result.rows);
    
  } catch (error) {
    console.error('Student search error:', error);
    res.status(500).json({ 
      error: 'Failed to search courses and modules',
      message: error.message
    });
  }
};


// Add this test endpoint to your routes file to verify everything
export const testEndpoint = async (req, res) => {
  console.log('=== TEST ENDPOINT ===');
  console.log('req.user:', req.user);
  
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection OK');
    
    res.json({
      message: 'Everything is working!',
      user: req.user,
      dbConnection: 'OK',
      timestamp: result.rows[0]
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({
      error: err.message,
      user: req.user
    });
  }
};