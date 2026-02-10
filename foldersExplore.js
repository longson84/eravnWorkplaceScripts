/**
 * CẤU HÌNH TẠI ĐÂY
 */
function main() {
  // 1. CHỌN TÁC VỤ: 
  // 'LIST' = Liệt kê danh sách file
  // 'STATS' = Thống kê số lượng & file mới 24h
  var action = 'STATS'; 

  // 2. ĐIỀN ID FOLDER VÀO ĐÂY
  var folderId = '0ADQHy521r1P4Uk9PVA';

  // --- HỆ THỐNG TỰ ĐỘNG CHẠY BÊN DƯỚI ---
  runTask(action, folderId);
}

/**
 * Hàm điều phối tác vụ
 */
function runTask(action, folderId) {
  try {
    var folder = DriveApp.getFolderById(folderId);
    console.log("📂 Đang xử lý thư mục: " + folder.getName());
    console.log("------------------------------------------");

    if (action === 'LIST') {
      executeListFolder(folder);
    } else if (action === 'STATS') {
      executeCountStatistics(folder);
    } else {
      console.log("❌ Lỗi: Tác vụ '" + action + "' không hợp lệ. Hãy chọn 'LIST' hoặc 'STATS'.");
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