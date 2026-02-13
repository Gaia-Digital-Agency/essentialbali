const requestTimer = (req, res, next) => {
  // 1. Catat waktu mulai permintaan
  const start = process.hrtime();

  // 2. Fungsi untuk menghitung dan mencatat waktu akhir
  res.on("finish", () => {
    // process.hrtime() mengembalikan [detik, nanodetik]
    const diff = process.hrtime(start);
    // Konversi ke milidetik
    const responseTimeInMs = (diff[0] * 1e9 + diff[1]) / 1e6;

    // 3. Catat metriknya
    // console.log(
    //   `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${
    //     res.statusCode
    //   } - ${responseTimeInMs.toFixed(3)} ms`
    // );
  });

  // Lanjutkan ke handler berikutnya (controller)
  next();
};

export default requestTimer;