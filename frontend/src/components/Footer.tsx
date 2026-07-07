import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.png';

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TelegramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.127.037.336.026.478-.164 2.155-.921 5.202-1.442 7.42-.222.941-.464 1.546-.755 1.948-.254.351-.534.542-.891.496-.384-.048-.838-.307-1.293-.53-.585-.317-1.068-.551-1.675-.324-.521.195-1.02.478-1.494.752-.377.22-.763.444-1.168.529-.295.06-.583-.009-.807-.296a2.278 2.278 0 0 1-.241-.388c-.28-.613-.53-1.162-.796-1.724-.154-.326-.308-.65-.447-.983-.192-.462-.03-.699.211-.988.566-.678 1.174-1.333 1.768-1.996.236-.263.478-.518.707-.784.094-.11.162-.247.196-.397.05-.21.046-.43-.017-.586a1.04 1.04 0 0 0-.423-.509c-.378-.247-1.064-.57-1.713-.694-.305-.058-.614-.07-.904.025-.574.188-1.154.473-1.734.741-.337.156-.65.358-.97.537-.16.09-.308.202-.449.322-.277.227-.476.43-.349.862.498 1.244 2.065 4.327 2.822 5.622.06.103.118.206.195.294.345.404.704.857 1.054 1.272.12.143.259.27.42.365.437.258.981.284 1.256.04.55-.493 1.056-1.025 1.565-1.557.414-.433.83-.866 1.228-1.312.351-.393.188-.741.03-1.065l-.12-.263z" />
  </svg>
);

const DiscordIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 0 1-.0066.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
  </svg>
);

const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-app-text pt-12 pb-6 border-t border-app-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand + Description + Social */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 group">
              <img src={logoImg} alt="NovelNest" className="h-10 w-auto object-contain" />
              <span className="text-2xl font-bold text-app-text-strong group-hover:text-rose-400 transition-colors">NovelNest</span>
            </Link>
            <p className="text-app-text-muted text-sm leading-relaxed mt-4 mb-6">
              Đọc truyện online, truyện chữ, truyện full, truyện hay. Tổng hợp đầy đủ các thể loại truyện từ ngôn tình, kiếm hiệp, tiên hiệp, huyền huyễn, đô thị, linh dị,...
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-app-surface hover:bg-rose-500 hover:text-white transition-all text-slate-500">
                <FacebookIcon />
              </a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer" aria-label="Telegram"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-app-surface hover:bg-rose-500 hover:text-white transition-all text-slate-500">
                <TelegramIcon />
              </a>
              <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" aria-label="Discord"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-app-surface hover:bg-rose-500 hover:text-white transition-all text-slate-500">
                <DiscordIcon />
              </a>
            </div>
          </div>

          {/* Thông tin */}
          <div>
            <h4 className="text-base font-bold text-app-text-strong mb-5">Thông tin</h4>
            <div className="flex flex-col gap-3">
              <Link to="/stories" className="text-sm text-app-text-muted hover:text-rose-500 transition-colors">Tất cả truyện</Link>
              <Link to="/" className="text-sm text-app-text-muted hover:text-rose-500 transition-colors">Trang chủ</Link>
            </div>
          </div>

          {/* Quy định */}
          <div>
            <h4 className="text-base font-bold text-app-text-strong mb-5">Quy định</h4>
            <p className="text-app-text-muted text-sm leading-relaxed mb-4">
              Các tác giả vui lòng tuân thủ các quy định của Nhà nước về quản lý thông tin trên Internet khi đăng tải tác phẩm. Chúng tôi kiên quyết từ chối các tiểu thuyết khiêu dâm và sẽ xóa bỏ ngay lập tức nếu phát hiện.
            </p>
            <p className="text-app-text-muted text-sm leading-relaxed">
              Mọi thông tin và hình ảnh trên trang web đều do bên thứ ba đăng tải. NovelNest hoàn toàn không chịu trách nhiệm về bất kỳ nội dung nào trên trang web này.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-app-border text-center">
          <p className="text-app-text-muted text-sm">&copy; {new Date().getFullYear()} NovelNest. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
