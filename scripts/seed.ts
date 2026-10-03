import "dotenv/config";
import { db } from "../lib/db";

const courses = [
  [1, "Full Stack Web Development (MERN)", "full-stack-mern", "Web Development", "MongoDB, Express.js, React, Node.js", "Beginner", "6 Months", 240, 35000, "Online", "English", true, 5, true, true, "Basic Computer Knowledge"],
  [2, "Python Full Stack Development", "python-full-stack", "Programming", "Python, Django, React", "Beginner", "6 Months", 250, 32000, "Hybrid", "English", true, 4, true, true, "No Programming Required"],
  [3, "Java Full Stack Development", "java-full-stack", "Programming", "Java, Spring Boot, React", "Beginner", "7 Months", 280, 38000, "Offline", "English", true, 5, true, true, "Basic Computer Knowledge"],
  [4, "Data Science with Python", "data-science-python", "Data Science", "Python, Pandas, NumPy, Scikit-Learn", "Intermediate", "5 Months", 200, 42000, "Online", "English", true, 4, true, true, "Python Basics"],
  [5, "Artificial Intelligence & Machine Learning", "ai-machine-learning", "Artificial Intelligence", "Python, TensorFlow, PyTorch", "Intermediate", "6 Months", 240, 48000, "Hybrid", "English", true, 5, true, true, "Python Basics"],
  [6, "Generative AI & Prompt Engineering", "generative-ai", "Artificial Intelligence", "ChatGPT, LangChain, OpenAI API", "Beginner", "2 Months", 80, 18000, "Online", "English", true, 3, false, true, "No Experience Required"],
  [7, "Cloud Computing with AWS", "aws-cloud", "Cloud Computing", "AWS", "Intermediate", "3 Months", 120, 25000, "Online", "English", true, 3, false, true, "Linux Basics"],
  [8, "DevOps & CI/CD", "devops", "DevOps", "Docker, Kubernetes, Jenkins, GitHub Actions", "Intermediate", "4 Months", 160, 30000, "Hybrid", "English", true, 4, true, true, "Linux & Git Basics"],
  [9, "Cyber Security & Ethical Hacking", "cyber-security", "Cyber Security", "Kali Linux, Burp Suite, Metasploit", "Intermediate", "5 Months", 200, 40000, "Offline", "English", true, 4, true, true, "Networking Basics"],
  [10, "Flutter App Development", "flutter", "Mobile Development", "Flutter, Dart", "Beginner", "4 Months", 160, 26000, "Online", "English", true, 3, false, true, "No Experience Required"],
  [11, "Android Development with Kotlin", "android-kotlin", "Mobile Development", "Kotlin, Android Studio", "Intermediate", "5 Months", 180, 30000, "Hybrid", "English", true, 4, true, true, "Programming Basics"],
  [12, "React.js Development", "react-js", "Frontend Development", "React.js", "Beginner", "2 Months", 80, 15000, "Online", "English", true, 2, false, true, "HTML, CSS, JavaScript"],
  [13, "Next.js Development", "next-js", "Frontend Development", "Next.js", "Intermediate", "2 Months", 90, 18000, "Online", "English", true, 2, false, true, "React.js"],
  [14, "Node.js Backend Development", "node-js", "Backend Development", "Node.js, Express.js", "Intermediate", "3 Months", 120, 22000, "Hybrid", "English", true, 3, true, true, "JavaScript"],
  [15, "PHP Laravel Development", "php-laravel", "Web Development", "PHP, Laravel", "Beginner", "4 Months", 150, 22000, "Offline", "English", true, 3, true, true, "HTML Basics"],
  [16, "Django Web Development", "django", "Web Development", "Python, Django", "Intermediate", "3 Months", 120, 24000, "Online", "English", true, 3, true, true, "Python Basics"],
  [17, "UI/UX Design", "ui-ux", "Design", "Figma, Adobe XD", "Beginner", "3 Months", 100, 18000, "Online", "English", true, 2, false, true, "No Experience Required"],
  [18, "Software Testing (Manual + Automation)", "software-testing", "Testing", "Selenium, Java", "Beginner", "4 Months", 150, 22000, "Hybrid", "English", true, 3, true, true, "Basic Computer Knowledge"],
  [19, "Linux System Administration", "linux-admin", "System Administration", "Ubuntu, CentOS", "Intermediate", "3 Months", 120, 20000, "Offline", "English", true, 2, false, true, "Basic Computer Knowledge"],
  [20, "Networking (CCNA)", "ccna", "Networking", "Cisco CCNA", "Beginner", "3 Months", 120, 25000, "Offline", "English", true, 2, false, true, "Basic Computer Knowledge"],
];

async function main() {
  await db.query("BEGIN");
  try {
    for (const c of courses) {
      await db.query(
        `INSERT INTO courses
          (id, course_name, slug, category, technology, level, duration, total_hours,
           fees, mode, language, certificate, live_projects, internship, job_assistance,
           prerequisites, status, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'Active',NOW())
         ON CONFLICT (slug) DO UPDATE SET
           course_name=EXCLUDED.course_name, category=EXCLUDED.category,
           technology=EXCLUDED.technology, level=EXCLUDED.level,
           duration=EXCLUDED.duration, total_hours=EXCLUDED.total_hours,
           fees=EXCLUDED.fees, mode=EXCLUDED.mode, language=EXCLUDED.language,
           certificate=EXCLUDED.certificate, live_projects=EXCLUDED.live_projects,
           internship=EXCLUDED.internship, job_assistance=EXCLUDED.job_assistance,
           prerequisites=EXCLUDED.prerequisites, status='Active', updated_at=NOW()`,
        c,
      );
    }
    await db.query("SELECT setval(pg_get_serial_sequence('courses','id'), COALESCE((SELECT MAX(id) FROM courses), 1), true)");
    await db.query("COMMIT");
    console.log(`Seeded ${courses.length} courses.`);
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  } finally {
    await db.end();
  }
}
main().catch((error) => { console.error(error); process.exit(1); });
