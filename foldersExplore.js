function main() {
  // THAY THẾ ID thư mục gốc của bạn vào đây
  // Đổi thử
  var rootFolderId = '1Om68lBVYFWNJtZsPbfyETRdUl_49rMZZ'; 
  
  try {
    var rootFolder = DriveApp.getFolderById(rootFolderId);
    console.log("BẮT ĐẦU QUÉT THƯ MỤC...");
    
    // Gọi hàm đệ quy bắt đầu từ thư mục gốc
    // Cấp độ 0 đại diện cho thư mục gốc
    listAllContents(rootFolder, 0);
    
    console.log("--- HOÀN THÀNH ---");
  } catch (e) {
    console.log("Lỗi: " + e.message);
  }
}

/**
 * Hàm đệ quy để quét file và thư mục con
 */
function listAllContents(folder, level) {
  var indent = "";
  for (var i = 0; i < level; i++) {
    indent += "  "; // Tạo khoảng thụt đầu dòng cho cấp bậc
  }

  // 1. In tên thư mục hiện tại
  var folderPrefix = (level === 0) ? "" : "--";
  console.log(indent + folderPrefix + folder.getName());

  // 2. Liệt kê tất cả file trong thư mục này
  var files = folder.getFiles();
  var fileIndent = indent + (level === 0 ? "   " : "     ");
  
  while (files.hasNext()) {
    var file = files.next();
    var name = file.getName();
    var id = file.getId();
    var created = Utilities.formatDate(file.getDateCreated(), Session.getScriptTimeZone(), "dd/MM/yyyy");
    var modified = Utilities.formatDate(file.getLastUpdated(), Session.getScriptTimeZone(), "dd/MM/yyyy");
    
    // Định dạng output: --- file - id - ngày tạo - ngày đổi
    console.log(fileIndent + "--- " + name + " - " + id + " - " + created + " - " + modified);
  }

  // 3. Tìm các thư mục con và tiếp tục gọi đệ quy
  var subFolders = folder.getFolders();
  while (subFolders.hasNext()) {
    var subFolder = subFolders.next();
    listAllContents(subFolder, level + 1);
  }
}