const ytdl = require('ytdl-core');
const fs = require('fs');
const readline = require('readline');
const chalk = require('chalk');

const outputFolderPath = './video'; // İndirilen video dosyasının çıktı klasörü

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(`
\x1b[33m

    
░█████╗░████████╗██╗░░██╗███████╗███╗░░██╗░█████╗░██╗░░██╗
██╔══██╗╚══██╔══╝██║░░██║██╔════╝████╗░██║██╔══██╗╚██╗██╔╝
███████║░░░██║░░░███████║█████╗░░██╔██╗██║███████║░╚███╔╝░
██╔══██║░░░██║░░░██╔══██║██╔══╝░░██║╚████║██╔══██║░██╔██╗░
██║░░██║░░░██║░░░██║░░██║███████╗██║░╚███║██║░░██║██╔╝╚██╗
╚═╝░░╚═╝░░░╚═╝░░░╚═╝░░╚═╝╚══════╝╚═╝░░╚══╝╚═╝░░╚═╝╚═╝░░╚═╝
\x1b[0m`)

// YouTube videoyu indirme fonksiyonu
const downloadVideo = (url, outputFolder, format) => {
  const videoFormat = format === 'mp3' ? 'mp3' : 'mp4';
  const fileName = `${new Date().getTime()}.${videoFormat}`;
  const outputPath = `${outputFolder}/${fileName}`;

  const videoStream = ytdl(url, { quality: 'highest' });
  const outputStream = fs.createWriteStream(outputPath);

  let downloadedBytes = 0;
  let totalBytes = 0;

  videoStream.on('response', (res) => {
    totalBytes = parseInt(res.headers['content-length'], 10);
  });

  videoStream.on('data', (chunk) => {
    downloadedBytes += chunk.length;
    const progress = (downloadedBytes / totalBytes) * 100;
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(chalk.red(`İndiriliyor: ${progress.toFixed(2)}%`));
  });

  videoStream.pipe(outputStream);

  videoStream.on('finish', () => {
    console.log(chalk.green(`\nVideo indirme tamamlandı. Dosya: ${outputPath}`));
    getVideoInfo(url);
  });

  videoStream.on('error', (err) => {
    console.error(chalk.red('Video indirme sırasında bir hata oluştu:'), err);
  });
};

// Video bilgilerini alma fonksiyonu
const getVideoInfo = (videoURL) => {
    const videoInfo = ytdl.getInfo(videoURL);
    videoInfo.then((info) => {
      console.log(chalk.green(`Video Başlığı: ${info.videoDetails.title}`));
      console.log(chalk.green(`Video Süresi: ${formatDuration(info.videoDetails.lengthSeconds)}`));
      console.log(chalk.green(`Görüntülenme Sayısı: ${info.videoDetails.viewCount}`));
    }).catch((err) => {
      console.error(chalk.red('Video bilgileri alınırken bir hata oluştu:'), err);
    });
  };
  
// Süreyi biçimlendirme fonksiyonu
const formatDuration = (durationSeconds) => {
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = durationSeconds % 60;

  return `${hours}:${minutes}:${seconds}`;
};

// Kullanıcıdan indirme formatını seçmesini isteyen fonksiyon
const askFormat = (videoURL) => {
  rl.question(chalk.green('İndirmek istediğinize emin misiniz? (Evet/Hayır): '), (answer) => {
    if (answer.toLowerCase() === 'evet' || answer.toLowerCase() === 'e') {
      rl.question(chalk.green('Videoyu hangi formatta indirmek istersiniz? (mp3/mp4): '), (format) => {
        if (format === 'mp3' || format === 'mp4') {
          rl.close();
          downloadVideo(videoURL, outputFolderPath, format);
        } else {
          console.log(chalk.red('Geçersiz format! Lütfen mp3 veya mp4 girin.'));
          askFormat(videoURL);
        }
      });
    } else {
      console.log(chalk.red('İndirme işlemi iptal edildi.'));
      rl.close();
    }
  });
};

// Video URL'sini komut satırından al
rl.question(chalk.green('İndirmek istediğiniz video URL\'sini girin: '), (videoURL) => {
  askFormat(videoURL);
});
