/**
 * CẤU HÌNH TẠI ĐÂY
 */
function main() {
  // 1. CHỌN TÁC VỤ: 
  // 'LIST' = Liệt kê danh sách file
  // 'STATS' = Thống kê số lượng & file mới 24h
  // 'COUNT_BY_DATE' = Đếm file có ngày tạo hoặc cập nhật >= myDate
  var action = 'COUNT_BY_DATE'; 

  // 2. ĐIỀN ID FOLDER VÀO ĐÂY
  var folderId = '1gLxEVmX1zxHYPaeaVQb57hia-N7b0gub';

  // 3. ĐIỀN NGÀY VÀO ĐÂY (Áp dụng cho tác vụ COUNT_BY_DATE)
  // Định dạng chuẩn: 'YYYY-MM-DD' hoặc 'YYYY-MM-DDTHH:mm:ss'
  var myDate = new Date('2024-01-01'); 

  // --- HỆ THỐNG TỰ ĐỘNG CHẠY BÊN DƯỚI ---
  runTask(action, folderId, myDate);
}

/**
 * Hàm điều phối tác vụ
 */
function runTask(action, folderId, targetDate) {
  try {
    var folder = DriveApp.getFolderById(folderId);
    console.log("📂 Đang xử lý thư mục: " + folder.getName());
    console.log("------------------------------------------");

    if (action === 'LIST') {
      executeListFolder(folder);
    } else if (action === 'STATS') {
      executeCountStatistics(folder);
    } else if (action === 'COUNT_BY_DATE') {
      executeCountByDate(folder, targetDate); 
    } else {
      console.log("❌ Lỗi: Tác vụ '" + action + "' không hợp lệ.");
    }

    console.log("------------------------------------------");
    console.log("✅ HOÀN THÀNH.");
  } catch (e) {
    console.log("❌ LỖI: " + e.message);
  }
}

// ==========================================
// NHÓM HÀM THỰC THI (WORKERS)
// ==========================================

/**
 * TÁC VỤ 1: Liệt kê cấu trúc (Explore)
 */
function executeListFolder(folder) {
  recursiveExplore(folder, 0);
}

function recursiveExplore(folder, level) {
  var indent = " ".repeat(level * 4);
  var prefix = (level === 0) ? "⭐ " : "┗📂 ";
  console.log(indent + prefix + folder.getName().toUpperCase());

  var files = folder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    console.log(indent + "    📄 " + file.getName());
  }

  var subFolders = folder.getFolders();
  while (subFolders.hasNext()) {
    recursiveExplore(subFolders.next(), level + 1);
  }
}

/**
 * TÁC VỤ 2: Thống kê (Statistics)
 */
function executeCountStatistics(folder) {
  var stats = {
    total: 0,
    new24h: 0,
    newList: []
  };

  recursiveCount(folder, stats);

  console.log("📊 KẾT QUẢ THỐNG KÊ:");
  console.log("- Tổng số file: " + stats.total);
  console.log("- Số file mới (24h qua): " + stats.new24h);
  
  if (stats.newList.length > 0) {
    console.log("\n📝 DANH SÁCH FILE MỚI:");
    stats.newList.forEach(function(name) {
      console.log("  + " + name);
    });
  }
}

function recursiveCount(folder, stats) {
  var now = new Date();
  var oneDayMs = 24 * 60 * 60 * 1000;

  var files = folder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    stats.total++;

    if (now - file.getLastUpdated() < oneDayMs) {
      stats.new24h++;
      stats.newList.push(file.getName() + " (Cập nhật: " + Utilities.formatDate(file.getLastUpdated(), Session.getScriptTimeZone(), "HH:mm dd/MM") + ")");
    }
  }

  var subFolders = folder.getFolders();
  while (subFolders.hasNext()) {
    recursiveCount(subFolders.next(), stats);
  }
}

/**
 * TÁC VỤ 3: Đếm file theo mốc thời gian, tính dung lượng & lấy link folder
 */
function executeCountByDate(folder, targetDate) {
  if (!targetDate || isNaN(targetDate.getTime())) {
    console.log("❌ Lỗi: Ngày nhập vào (myDate) không hợp lệ. Vui lòng kiểm tra lại định dạng.");
    return;
  }

  var stats = {
    count: 0,
    totalSize: 0, // Thêm biến lưu tổng dung lượng (byte)
    list: []
  };

  var formattedDate = Utilities.formatDate(targetDate, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm");
  console.log("🔍 Tìm các file Tạo hoặc Sửa đổi từ: " + formattedDate);
  
  recursiveCountByDate(folder, targetDate, stats);

  console.log("📊 KẾT QUẢ TÌM KIẾM:");
  console.log("- Tổng số file đạt điều kiện: " + stats.count + " file");
  console.log("- Tổng dung lượng: " + formatBytes(stats.totalSize)); // In tổng dung lượng
  
  if (stats.list.length > 0) {
    console.log("\n📝 DANH SÁCH CHI TIẾT:");
    stats.list.forEach(function(info) {
      console.log("  + " + info);
    });
  }
}

function recursiveCountByDate(folder, targetDate, stats) {
  var files = folder.getFiles();
  var tz = Session.getScriptTimeZone();

  while (files.hasNext()) {
    var file = files.next();
    var created = file.getDateCreated();
    var modified = file.getLastUpdated();

    if (created >= targetDate || modified >= targetDate) {
      stats.count++;
      
      // Lấy dung lượng file và cộng dồn
      var sizeInBytes = file.getSize();
      stats.totalSize += sizeInBytes;
      var strSize = formatBytes(sizeInBytes);

      // Lấy đường link của thư mục chứa file (Parent Folder)
      var parents = file.getParents();
      var parentFolderUrl = "Không xác định";
      if (parents.hasNext()) {
        parentFolderUrl = parents.next().getUrl();
      }

      var strCreated = Utilities.formatDate(created, tz, "dd/MM/yyyy");
      var strModified = Utilities.formatDate(modified, tz, "dd/MM/yyyy");
      
      // Đưa thông tin vào danh sách hiển thị
      stats.list.push(
        file.getName() + 
        " | Dung lượng: " + strSize + 
        " | (Tạo: " + strCreated + ", Sửa: " + strModified + ")" + 
        "\n      Link Folder: " + parentFolderUrl
      );
    }
  }

  var subFolders = folder.getFolders();
  while (subFolders.hasNext()) {
    recursiveCountByDate(subFolders.next(), targetDate, stats);
  }
}

/**
 * HÀM HỖ TRỢ: Chuyển đổi dung lượng từ Byte sang KB, MB, GB...
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  var k = 1024;
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  var i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}