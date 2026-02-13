const z = require("zod");
const validator = require("validator");

const zodString = (key) => {
  return z.string({
    invalid_type_error: `tipe data ${key} tidak valid, seharusnya string`,
    required_error: `${key} diperlukan, tidak boleh kosong`,
  });
};

const zodNumber = (key) => {
  return z.number({
    invalid_type_error: `tipe data ${key} tidak valid, seharusnya number`,
    required_error: `${key} diperlukan, tidak boleh kosong`,
  });
};

const zodArray = (key, data) => {
  return z.array(data, {
    invalid_type_error: `tipe data ${key} tidak valid, seharusnya number`,
    required_error: `${key} diperlukan, tidak boleh kosong`,
  });
};

exports.validasiString = (nama) =>
  z.object({
    [nama]: z.string({
      invalid_type_error: nama + " tidak valid",
      required_error: nama + " tidak boleh kosong",
    }),
  });

exports.validasiNumber = (angka) =>
  z.object({
    [angka]: z.number({
      invalid_type_error: angka + " tidak valid",
      required_error: angka + " tidak boleh kosong",
    }),
  });
