/* ============================================
   data.js - Tất cả dữ liệu tĩnh (JSON-driven)
   Linh kiện, app, sách, website, tài sản, v.v.
   ============================================ */

const DATA = {
    /* --- LINH KIỆN PHẦN CỨNG --- */
    hardware: {
        cpu: [
            { id: 'pentium', name: 'Intel Pentium G6400', cores: 2, threads: 4, speed: 1.0, price: 0, icon: '🔲' },
            { id: 'i3', name: 'Intel Core i3-12100', cores: 4, threads: 8, speed: 1.8, price: 500, icon: '🔲' },
            { id: 'i5', name: 'Intel Core i5-13600K', cores: 6, threads: 12, speed: 2.5, price: 1500, icon: '🔲' },
            { id: 'i7', name: 'Intel Core i7-14700K', cores: 8, threads: 16, speed: 3.5, price: 3500, icon: '🔲' },
            { id: 'i9', name: 'Intel Core i9-14900K', cores: 12, threads: 24, speed: 4.5, price: 6000, icon: '🔲' },
            { id: 'm1', name: 'Apple M1', cores: 8, threads: 8, speed: 5.0, price: 8000, icon: '🍎' },
            { id: 'm2', name: 'Apple M2 Pro', cores: 10, threads: 10, speed: 6.5, price: 12000, icon: '🍎' },
            { id: 'm3', name: 'Apple M3 Max', cores: 14, threads: 14, speed: 8.0, price: 18000, icon: '🍎' },
            { id: 'm4', name: 'Apple M4 Ultra', cores: 16, threads: 16, speed: 9.5, price: 28000, icon: '🍎' },
            { id: 'm5', name: 'Apple M5 Max', cores: 20, threads: 20, speed: 12.0, price: 50000, icon: '🍎' }
        ],
        ram: [
            { id: 'ram4', name: '4 GB DDR4', total: 4096, speed: 1.0, price: 0, icon: '💾' },
            { id: 'ram8', name: '8 GB DDR4', total: 8192, speed: 1.5, price: 400, icon: '💾' },
            { id: 'ram16', name: '16 GB DDR5', total: 16384, speed: 2.5, price: 1200, icon: '💾' },
            { id: 'ram32', name: '32 GB DDR5', total: 32768, speed: 3.5, price: 3000, icon: '💾' },
            { id: 'ram64', name: '64 GB DDR5', total: 65536, speed: 4.5, price: 6000, icon: '💾' },
            { id: 'ram128', name: '128 GB DDR5', total: 131072, speed: 5.5, price: 12000, icon: '💾' }
        ],
        disk: [
            { id: 'hdd500', name: 'HDD 500 GB', total: 512000, readSpeed: 80, writeSpeed: 60, price: 0, icon: '💿' },
            { id: 'ssd256', name: 'SSD 256 GB', total: 262144, readSpeed: 500, writeSpeed: 400, price: 500, icon: '💽' },
            { id: 'ssd512', name: 'SSD 512 GB', total: 524288, readSpeed: 550, writeSpeed: 500, price: 1000, icon: '💽' },
            { id: 'ssd1t', name: 'SSD 1 TB', total: 1048576, readSpeed: 700, writeSpeed: 650, price: 2000, icon: '💽' },
            { id: 'nvme1t', name: 'NVMe 1 TB', total: 1048576, readSpeed: 3500, writeSpeed: 3000, price: 4000, icon: '⚡' },
            { id: 'nvme2t', name: 'NVMe 2 TB', total: 2097152, readSpeed: 7000, writeSpeed: 6000, price: 8000, icon: '⚡' },
            { id: 'nvme4t', name: 'NVMe 4 TB', total: 4194304, readSpeed: 10000, writeSpeed: 9000, price: 16000, icon: '⚡' }
        ],
        gpu: [
            { id: 'igpu', name: 'Integrated GPU', power: 1.0, price: 0, icon: '🖥️' },
            { id: 'gtx1060', name: 'GTX 1060 6GB', power: 2.5, price: 800, icon: '🎮' },
            { id: 'rtx3060', name: 'RTX 3060 12GB', power: 4.0, price: 2500, icon: '🎮' },
            { id: 'rtx4070', name: 'RTX 4070 Ti', power: 6.0, price: 5000, icon: '🎮' },
            { id: 'rtx4090', name: 'RTX 4090 24GB', power: 9.0, price: 12000, icon: '🎮' },
            { id: 'rx7900', name: 'RX 7900 XTX', power: 8.5, price: 10000, icon: '🎮' },
            { id: 'proGPU', name: 'Apple M5 GPU', power: 11.0, price: 30000, icon: '🍎' }
        ],
        network: [
            { id: 'net10', name: '10 Mbps', speed: 10, price: 0, icon: '📶' },
            { id: 'net50', name: '50 Mbps', speed: 50, price: 300, icon: '📶' },
            { id: 'net100', name: '100 Mbps', speed: 100, price: 800, icon: '📶' },
            { id: 'net500', name: '500 Mbps', speed: 500, price: 2000, icon: '📶' },
            { id: 'net1g', name: '1 Gbps', speed: 1000, price: 4000, icon: '🌐' },
            { id: 'net10g', name: '10 Gbps', speed: 10000, price: 10000, icon: '🌐' }
        ]
    },

    /* --- ỨNG DỤNG MẶC ĐỊNH (đã cài sẵn) --- */
    defaultApps: [
        'finder', 'app-store', 'settings', 'task-manager', 'calculator', 'notes', 'browser'
    ],

    /* --- ỨNG DỤNG CÀI THÊM TỪ APP STORE --- */
    storeApps: [
        { id: 'hardware-shop', name: 'Hardware Shop', icon: '🛒', size: 45, category: 'Utilities', desc: 'Mua và nâng cấp linh kiện phần cứng' },
        { id: 'ebook-reader', name: 'iBooks', icon: '📚', size: 32, category: 'Productivity', desc: 'Đọc sách điện tử' },
        { id: 'internet-manager', name: 'Downloads', icon: '📥', size: 18, category: 'Utilities', desc: 'Quản lý tải xuống / tải lên' },
        { id: 'casino', name: 'Casino Royale', icon: '🎰', size: 68, category: 'Games', desc: 'Bầu cua, quay số, bài...' },
        { id: 'asset-shop', name: 'Trading Hub', icon: '📈', size: 42, category: 'Finance', desc: 'Mua bán tài sản, chứng khoán' },
        { id: 'zalo', name: 'Zalo', icon: '💬', size: 85, category: 'Social', desc: 'Nhắn tin, gọi điện, video call' },
        { id: 'tinder', name: 'Tinder', icon: '🔥', size: 72, category: 'Social', desc: 'Hẹn hò trực tuyến' },
        { id: 'office365', name: 'Office 365', icon: '📝', size: 150, category: 'Productivity', desc: 'Soạn thảo văn bản, bảng tính' },
        { id: 'antivirus', name: 'Antivirus Pro', icon: '🛡️', size: 95, category: 'Utilities', desc: 'Bảo vệ máy tính khỏi virus' },
        { id: 'music', name: 'Apple Music', icon: '🎵', size: 55, category: 'Entertainment', desc: 'Nghe nhạc trực tuyến' },
        { id: 'photos', name: 'Photos', icon: '🖼️', size: 38, category: 'Productivity', desc: 'Quản lý ảnh' },
        { id: 'weather', name: 'Weather', icon: '🌤️', size: 12, category: 'Utilities', desc: 'Dự báo thời tiết' },
        { id: 'maps', name: 'Maps', icon: '🗺️', size: 65, category: 'Utilities', desc: 'Bản đồ và chỉ đường' },
        { id: 'clock', name: 'Clock', icon: '⏰', size: 8, category: 'Utilities', desc: 'Đồng hồ, hẹn giờ, bấm giờ' }
    ],

    /* --- APP DEFINITIONS (icon + tên cho tất cả app) --- */
    appDefs: {
        'finder': { name: 'Finder', icon: '📁', dock: true },
        'app-store': { name: 'App Store', icon: '🏪', dock: true },
        'settings': { name: 'Settings', icon: '⚙️', dock: true },
        'task-manager': { name: 'Task Manager', icon: '📊', dock: true },
        'calculator': { name: 'Calculator', icon: '🧮', dock: true },
        'notes': { name: 'Notes', icon: '📝', dock: true },
        'browser': { name: 'Safari', icon: '🌐', dock: true },
        'hardware-shop': { name: 'Hardware Shop', icon: '🛒', dock: false },
        'ebook-reader': { name: 'iBooks', icon: '📚', dock: false },
        'internet-manager': { name: 'Downloads', icon: '📥', dock: false },
        'casino': { name: 'Casino Royale', icon: '🎰', dock: false },
        'asset-shop': { name: 'Trading Hub', icon: '📈', dock: false },
        'zalo': { name: 'Zalo', icon: '💬', dock: false },
        'tinder': { name: 'Tinder', icon: '🔥', dock: false },
        'office365': { name: 'Office 365', icon: '📝', dock: false },
        'antivirus': { name: 'Antivirus Pro', icon: '🛡️', dock: false },
        'music': { name: 'Apple Music', icon: '🎵', dock: false },
        'photos': { name: 'Photos', icon: '🖼️', dock: false },
        'weather': { name: 'Weather', icon: '🌤️', dock: false },
        'maps': { name: 'Maps', icon: '🗺️', dock: false },
        'clock': { name: 'Clock', icon: '⏰', dock: false }
    },

    /* --- SÁCH ĐIỆN TỬ --- */
    books: [
        {
            title: 'Đắc Nhân Tâm',
            author: 'Dale Carnegie',
            pages: [
                'Chương 1: Nguyên tắc cơ bản trong giao tiếp\n\nNếu bạn muốn thu hoạch mật ong, đừng đá đổ tổ ong. Bất kỳ kẻ ngốc nào cũng có thể chỉ trích, kết án và phàn nàn - và hầu hết kẻ ngốc đều làm vậy.\n\nNhưng cần phải có tính cách và tự chủ để thấu hiểu và tha thứ.',
                'Chương 2: Bí quyết lớn nhất trong giao tiếp\n\nCách duy nhất để ảnh hưởng đến người khác là nói về điều họ muốn và chỉ cho họ cách đạt được nó.\n\nHãy nhớ rằng mỗi người đều quan tâm đến bản thân mình gấp trăm lần so với quan tâm đến bạn.',
                'Chương 3: Ai làm được điều này sẽ có cả thế giới\n\nHãy đặt mình vào vị trí của người khác. Nếu có bí quyết thành công nào đó, thì đó là khả năng nhìn nhận vấn đề từ quan điểm của người khác.',
                'Chương 4: Làm thế nào để trở nên thú vị\n\nHãy trở thành người lắng nghe tốt. Khuyến khích người khác nói về bản thân họ. Luôn luôn làm cho người khác cảm thấy quan trọng.'
            ]
        },
        {
            title: 'Nhà Giả Kim',
            author: 'Paulo Coelho',
            pages: [
                'Phần 1: Giấc mơ của Santiago\n\nCậu bé chăn cừu Santiago có một giấc mơ lặp đi lặp lại về kho báu ẩn giấu gần Kim tự tháp Ai Cập. Một ngày, cậu quyết định theo đuổi giấc mơ đó.\n\n"Khi bạn muốn điều gì đó thật sự, cả vũ trụ sẽ hợp lại giúp bạn đạt được nó."',
                'Phần 2: Hành trình qua sa mạc\n\nSantiago gặp nhà giả kim - người dạy cậu lắng nghe trái tim mình. Trên đường đi, cậu học được nhiều bài học quý giá.\n\n"Hãy lắng nghe trái tim mình, vì nó đến từ Linh Hồn của Thế Giới."',
                'Phần 3: Kho báu thật sự\n\nSau bao gian khổ, Santiago nhận ra rằng hành trình quan trọng hơn đích đến. Kho báu không chỉ là vàng bạc mà còn là những trải nghiệm và bài học.\n\n"Bí mật nằm ở hiện tại. Nếu bạn chú ý đến hiện tại, bạn có thể cải thiện nó."'
            ]
        },
        {
            title: 'Tuổi Trẻ Đáng Giá Bao Nhiêu',
            author: 'Rosie Nguyễn',
            pages: [
                'Phần 1: Đi và trải nghiệm\n\nTuổi trẻ là khoảng thời gian đẹp nhất để bạn dám sống, dám mơ và dám thử thách bản thân. Đừng ngồi một chỗ và mơ về những điều lớn lao.',
                'Phần 2: Học và khám phá\n\nĐọc sách, du lịch, gặp gỡ những người khác - đó là cách bạn mở rộng tầm nhìn và hiểu biết về thế giới. Kiến thức là sức mạnh.',
                'Phần 3: Sống có ý nghĩa\n\nTuổi trẻ đáng giá khi bạn biết mình đang sống vì điều gì. Hãy tìm ra đam mê và theo đuổi nó hết mình.'
            ]
        }
    ],

    /* --- WEBSITE GIẢ LẬP --- */
    websites: {
        'google.com': {
            title: 'Google',
            content: '<div style="text-align:center;padding:60px 20px"><div style="font-size:48px;margin-bottom:20px">Google</div><input class="glass-input" style="width:80%;max-width:500px;padding:12px 20px;border-radius:24px;font-size:16px" placeholder="Tìm kiếm trên Google..."><div style="margin-top:20px;display:flex;gap:12px;justify-content:center"><button class="glass-btn">Tìm với Google</button><button class="glass-btn">Tôi may mắn</button></div></div>'
        },
        'news.vn': {
            title: 'Tin Tức Việt Nam',
            articles: [
                { title: 'Công nghệ AI phát triển vượt bậc trong năm 2026', content: 'Trí tuệ nhân tạo đã đạt được những bước tiến đáng kể, với khả năng xử lý ngôn ngữ tự nhiên ngày càng chính xác. Nhiều doanh nghiệp đã ứng dụng AI vào quy trình sản xuất và dịch vụ khách hàng.' },
                { title: 'Thị trường bất động sản khởi sắc', content: 'Giá nhà đất tại các thành phố lớn có xu hướng tăng trở lại sau giai đoạn điều chỉnh. Các chuyên gia dự đoán thị trường sẽ ổn định trong quý 2.' },
                { title: 'Việt Nam vô địch AFF Cup 2026', content: 'Đội tuyển Việt Nam đã xuất sắc giành chức vô địch AFF Cup 2026 sau trận chung kết kịch tính trước Thái Lan. Các cầu thủ đã thể hiện tinh thần thi đấu tuyệt vời.' },
                { title: 'Khám phá ẩm thực đường phố Sài Gòn', content: 'Sài Gòn nổi tiếng với nền ẩm thực đường phố phong phú. Từ phở, bánh mì đến bún riêu, mỗi món ăn đều mang hương vị đặc trưng của vùng đất Nam Bộ.' },
                { title: 'Ra mắt iPhone 18 với thiết kế đột phá', content: 'Apple vừa công bố iPhone 18 với nhiều cải tiến vượt trội về camera, chip xử lý và thời lượng pin. Sản phẩm được kỳ vọng sẽ tạo nên cơn sốt trên thị trường.' }
            ]
        },
        'youtube.com': {
            title: 'YouTube',
            content: '<div style="padding:20px"><div style="font-size:24px;color:#ff0000;margin-bottom:20px">▶ YouTube</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px"></div></div>'
        }
    },

    /* --- TIN TỨC CHO TRÌNH DUYỆT --- */
    newsArticles: [
        { title: 'Trí tuệ nhân tạo và tương lai của nhân loại', body: 'Các chuyên gia công nghệ cho rằng AI sẽ thay đổi hoàn toàn cách chúng ta làm việc và sinh hoạt trong 10 năm tới. Những tiến bộ trong machine learning và deep learning đang mở ra những khả năng chưa từng có.' },
        { title: 'Du lịch Đà Nẵng - Top 10 điểm đến hấp dẫn', body: 'Đà Nẵng là một trong những thành phố đáng sống nhất Việt Nam. Với bãi biển Mỹ Khê, Bà Nà Hills, và cầu Rồng, thành phố này thu hút hàng triệu du khách mỗi năm.' },
        { title: 'Bitcoin vượt mốc $200,000', body: 'Đồng tiền số Bitcoin đã chính thức vượt mốc $200,000, lập kỷ lục mới. Nhiều nhà đầu tư cho rằng xu hướng tăng giá sẽ tiếp tục trong năm 2026.' },
        { title: 'SpaceX hoàn thành chuyến bay có người lái lên Sao Hỏa', body: 'SpaceX đã thực hiện thành công chuyến bay có người lái đầu tiên đến Sao Hỏa. Đây là bước ngoặt lớn trong lịch sử khám phá vũ trụ của nhân loại.' },
        { title: 'Giải vô địch thể thao điện tử thế giới 2026', body: 'Giải đấu esports lớn nhất thế giới năm 2026 đã thu hút hơn 500 triệu người xem trực tuyến. Các đội tuyển đến từ châu Á tiếp tục thống trị các bộ môn.' }
    ],

    /* --- FILE GIẢ LẬP CHO DOWNLOAD --- */
    downloadFiles: [
        { name: 'macOS_Sequoia_15.2.dmg', size: 14500, icon: '💿' },
        { name: 'Xcode_16.pkg', size: 8200, icon: '📦' },
        { name: 'Final_Cut_Pro.dmg', size: 3800, icon: '🎬' },
        { name: 'Logic_Pro_X.dmg', size: 2400, icon: '🎵' },
        { name: 'Adobe_Photoshop_2026.dmg', size: 4200, icon: '🖼️' },
        { name: 'GTA_VI.zip', size: 125000, icon: '🎮' },
        { name: 'Project_Files.zip', size: 850, icon: '📁' },
        { name: 'Database_Backup.sql', size: 2100, icon: '🗃️' },
        { name: 'Training_Dataset.csv', size: 18000, icon: '📊' },
        { name: '4K_Movie_Collection.mkv', size: 45000, icon: '🎥' },
        { name: 'Music_Library.zip', size: 6500, icon: '🎵' },
        { name: 'Ubuntu_24.04.iso', size: 5200, icon: '💿' },
        { name: 'Windows_12.iso', size: 9800, icon: '💿' },
        { name: 'Office_Suite.msi', size: 3100, icon: '📝' },
        { name: 'Cloud_Backup_2026.tar.gz', size: 28000, icon: '☁️' }
    ],

    /* --- TÀI SẢN CHO ASSET SHOP --- */
    assets: {
        crypto: [
            { id: 'btc', name: 'Bitcoin (BTC)', basePrice: 200000, icon: '₿', volatility: 0.03 },
            { id: 'eth', name: 'Ethereum (ETH)', basePrice: 8500, icon: 'Ξ', volatility: 0.04 },
            { id: 'sol', name: 'Solana (SOL)', basePrice: 450, icon: '◎', volatility: 0.05 },
            { id: 'doge', name: 'Dogecoin (DOGE)', basePrice: 0.85, icon: '🐕', volatility: 0.08 }
        ],
        gold: [
            { id: 'gold1', name: 'Vàng SJC 1 chỉ', basePrice: 8500, icon: '🥇', volatility: 0.01 },
            { id: 'gold10', name: 'Vàng SJC 1 lượng', basePrice: 85000, icon: '🏅', volatility: 0.01 }
        ],
        realestate: [
            { id: 'land1', name: 'Đất nền Q.9 (100m²)', basePrice: 500000, icon: '🏗️', volatility: 0.005 },
            { id: 'apt1', name: 'Căn hộ Vinhomes 2PN', basePrice: 350000, icon: '🏢', volatility: 0.003 },
            { id: 'villa1', name: 'Biệt thự Thảo Điền', basePrice: 2000000, icon: '🏡', volatility: 0.002 }
        ],
        vehicles: [
            { id: 'bike1', name: 'Honda Vision 2026', basePrice: 3500, icon: '🏍️', volatility: 0.002 },
            { id: 'car1', name: 'Toyota Camry 2.5Q', basePrice: 150000, icon: '🚗', volatility: 0.003 },
            { id: 'car2', name: 'Mercedes S-Class', basePrice: 500000, icon: '🚘', volatility: 0.004 },
            { id: 'car3', name: 'Lamborghini Revuelto', basePrice: 1500000, icon: '🏎️', volatility: 0.005 }
        ]
    },

    /* --- DANH BẠ ZALO --- */
    contacts: [
        { id: 'kimngoc', name: 'Kim Ngọc', avatar: '👩', status: 'online', lastSeen: 'Đang hoạt động' },
        { id: 'kimnga', name: 'Kim Ngà', avatar: '👩‍🦱', status: 'online', lastSeen: 'Đang hoạt động' },
        { id: 'ngocthu', name: 'Huỳnh Ngọc Thư', avatar: '👧', status: 'offline', lastSeen: '2 giờ trước' },
        { id: 'minhtuan', name: 'Minh Tuấn', avatar: '👨', status: 'online', lastSeen: 'Đang hoạt động' },
        { id: 'thuytrang', name: 'Thùy Trang', avatar: '👩‍💼', status: 'offline', lastSeen: '30 phút trước' },
        { id: 'hoangnam', name: 'Hoàng Nam', avatar: '👦', status: 'online', lastSeen: 'Đang hoạt động' },
        { id: 'thanhha', name: 'Thanh Hà', avatar: '👩‍🎓', status: 'offline', lastSeen: '1 giờ trước' }
    ],

    /* --- TIN NHẮN MẪU (auto-reply rules) --- */
    chatRules: {
        'default': [
            'Ừ, mình hiểu rồi 😊',
            'Ok bạn ơi!',
            'Hay quá! 👍',
            'Mình cũng nghĩ vậy',
            'Để mình xem lại nhé',
            'Haha, vui ghê 😄',
            'Dạ, được ạ!',
            'Oke luôn nè',
            'Cảm ơn bạn nhé ❤️',
            'Wow, thật hả? 😮'
        ],
        'hello': ['Chào bạn! 👋', 'Hello! Bạn khỏe không?', 'Hi hi, lâu quá không gặp! 😊'],
        'bye': ['Bye bye! Hẹn gặp lại 👋', 'Tạm biệt nhé! 😘', 'Chào bạn, ngủ ngon!'],
        'love': ['❤️❤️❤️', 'Yêu bạn nhiều! 💕', 'Hihi, ngại quá 😊'],
        'eat': ['Mình ăn rồi! 🍜', 'Đang ăn phở nè 🍲', 'Chưa ăn, đói quá 😫'],
        'work': ['Đang làm việc bận lắm 💼', 'Mệt quá trời 😩', 'Sắp xong rồi, chờ mình chút!']
    },

    /* --- BẦU CUA ICONS --- */
    bauCua: [
        { id: 'bau', name: 'Bầu', emoji: '🎃' },
        { id: 'cua', name: 'Cua', emoji: '🦀' },
        { id: 'tom', name: 'Tôm', emoji: '🦐' },
        { id: 'ca', name: 'Cá', emoji: '🐟' },
        { id: 'ga', name: 'Gà', emoji: '🐓' },
        { id: 'nai', name: 'Nai', emoji: '🦌' }
    ],

    /* --- SLOT SYMBOLS --- */
    slotSymbols: ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '7️⃣', '🔔'],

    /* --- FINDER FILES --- */
    finderFiles: [
        { name: 'Documents', icon: '📁', type: 'folder' },
        { name: 'Downloads', icon: '📥', type: 'folder' },
        { name: 'Pictures', icon: '🖼️', type: 'folder' },
        { name: 'Music', icon: '🎵', type: 'folder' },
        { name: 'Desktop', icon: '🖥️', type: 'folder' },
        { name: 'README.txt', icon: '📄', type: 'file' },
        { name: 'Notes.txt', icon: '📝', type: 'file' },
        { name: 'photo.jpg', icon: '🖼️', type: 'file' },
        { name: 'song.mp3', icon: '🎵', type: 'file' },
        { name: 'video.mp4', icon: '🎬', type: 'file' }
    ]
};
