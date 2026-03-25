import express, { Request, Response } from 'express';
import axios from 'axios';

const app = express();
const PORT = 3009;

app.use(express.json());

// Giả sử đây là API mà Front-end (Vue.js) của bạn sẽ gọi
app.get('/api/user-summary/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    console.log(`--- BFF đang xử lý yêu cầu cho User ID: ${userId} ---`);

    // Bước 1: Gọi sang Server Core (Giả lập /lcnet/user) để lấy thông tin user
    const userResponse = await axios.get(`https://jsonplaceholder.typicode.com/users/${userId}`);
    const userData = userResponse.data;

    // Bước 2: Gọi sang Server Core khác (Giả lập /lcnet/posts) để lấy danh sách bài viết
    const postsResponse = await axios.get(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
    const userPosts = postsResponse.data;

    // Bước 3: "XÀO NẤU" DỮ LIỆU (Đây là nhiệm vụ chính của BFF)
    // Chúng ta chỉ lọc ra những thông tin FE thực sự cần để giảm dung lượng tải
    const refinedData = {
      userName: userData.name,
      email: userData.email,
      companyName: userData.company.name,
      totalPosts: userPosts.length,
      // Chỉ lấy 3 bài viết mới nhất
      latestPosts: userPosts.slice(0, 3).map((post: any) => ({
        title: post.title,
        body: post.body.substring(0, 50) + "..."
      }))
    };

    // Bước 4: Trả dữ liệu "sạch" về cho FE
    res.json(refinedData);

  } catch (error) {
    console.error("Lỗi khi gọi API Core:", error);
    res.status(500).json({ message: "BFF Error: Không thể lấy dữ liệu từ Server Core" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 BFF đang chạy tại: http://localhost:${PORT}`);
});