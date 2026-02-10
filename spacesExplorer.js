/**
 * SpacesExplorer - Kiến trúc hướng module
 * Cần bật Google Chat API v1
 * Cần link với Project trong Google Cloud với Chat API được mở
 * Cần thêm vào appscript.json
 * "oauthScopes": [
    "https://www.googleapis.com/auth/chat.spaces.readonly",
    "https://www.googleapis.com/auth/chat.memberships.readonly"
  ],
 */

// --- 1. CẤU HÌNH ĐIỀU KHIỂN ---
const CONFIG = {
  // TASK: 'GET_DETAILS',      // Chỉnh từ khóa tại đây để đổi tác vụ
  // TASK: 'LIST_SPACES',
  SPACE_ID: 'spaces/AAQA90bCk2k',  // ID mục tiêu cho các tác vụ chi tiết
};

// --- 2. HÀM MAIN (ĐIỀU PHỐI) ---
function main() {
  console.log("--- BẮT ĐẦU CHƯƠNG TRÌNH ---");

  // Bản đồ các tác vụ (Task Mapping)
  const tasks = {
    'LIST_SPACES':      listSpacesOnly,
    'GET_DETAILS':      getFullSpaceDetails,
    'EXPORT_SHEETS':    () => console.log("Tính năng đang phát triển...")
  };

  const currentTask = tasks[CONFIG.TASK];

  if (currentTask) {
    // Chạy tác vụ đã chọn
    currentTask(CONFIG.SPACE_ID);
  } else {
    console.error("Lỗi: Tác vụ '" + CONFIG.TASK + "' không tồn tại trong hệ thống.");
  }

  console.log("--- KẾT THÚC ---");
}

/**
 * Tác vụ: Liệt kê gọn theo yêu cầu
 * Output: Tên Space | ID | Ngoại bộ: Có/Không | Thành viên: Số lượng
 */
function listSpacesOnly() {
  let pageToken = null;
  let count = 0;

  try {
    do {
      const response = Chat.Spaces.list({
        pageSize: 100,
        pageToken: pageToken
      });

      if (response.spaces && response.spaces.length > 0) {
        response.spaces.forEach(space => {
          // Chỉ lấy loại SPACE
          if (space.spaceType === 'SPACE') {
            count++;
            
            const name = space.displayName || "Không tên";
            const id = space.name;
            
            // Thông tin số 4: Quyền truy cập ngoại bộ
            const external = space.externalUserAllowed ? "Có" : "Không";
            
            // Thông tin số 2: Số lượng thành viên (Nếu API trả về)
            const members = space.membershipCount !== undefined ? space.membershipCount : "N/A";

            const spaceUri = space.spaceUri;
            
            // Output trên một dòng duy nhất
            console.log(`${count}. ${name} | ID: ${id} | External Allowed: ${external} | Thành viên: ${members.joinedDirectHumanUserCount} | Link: ${spaceUri}`);
          }
        });
      }
      pageToken = response.nextPageToken;
    } while (pageToken);

    if (count === 0) console.log("Không tìm thấy Space nào.");
    else console.log(`\n=> Tổng cộng tìm thấy: ${count} Spaces.`);

  } catch (e) {
    console.log("Lỗi: " + e.message);
  }
}


/**
 * Tác vụ: Lấy TẤT CẢ thông tin có thể của một Space
 */
function getFullSpaceDetails(spaceId) {
  if (!spaceId || spaceId === 'spaces/XXXXXXX') {
    console.log("Lỗi: Bạn chưa nhập SPACE_ID vào phần CONFIG.");
    return;
  }

  try {
    console.log(`--- ĐANG TRUY XUẤT TOÀN BỘ DỮ LIỆU CỦA SPACE: ${spaceId} ---`);
    
    // Gọi API để lấy đối tượng Space đầy đủ
    const space = Chat.Spaces.get(spaceId);
    
    // In ra dưới dạng JSON đẹp mắt để soi từng thuộc tính
    const fullData = JSON.stringify(space, null, 2);
    console.log(fullData);

    console.log("---------------------------------------------------------");
    console.log("GỢI Ý CÁC THÔNG TIN BẠN CÓ THỂ THẤY TRONG DỮ LIỆU TRÊN:");
    console.log("- spaceThreadingState: Cách phân luồng tin nhắn.");
    console.log("- spaceHistoryState: Trạng thái lưu lịch sử trò chuyện.");
    console.log("- spaceUri: Đường link trực tiếp dẫn đến Space này.");
    console.log("- accessSettings: Cấu hình ai có thể tìm thấy/tham gia Space này.");
    if (space.importMode) console.log("- importMode: Space này có đang trong chế độ nhập dữ liệu cũ không.");

  } catch (e) {
    console.log("Lỗi khi truy xuất chi tiết: " + e.message);
    console.log("Gợi ý: Hãy đảm bảo ID có định dạng 'spaces/ABC12345'");
  }
}

