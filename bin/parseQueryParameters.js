function parseQueryParameters(queryArg) {
  const query = Object.assign({}, queryArg);
  const format = {};
  if ((query.w && !isNaN(parseInt(query.w, 10))) || (query.h && !isNaN(parseInt(query.h, 10)))) {
    format.gravity = 'Center';
    format.resize = {};
    if (query.h && query.h.length > 4) {
      const testHeightFirst = query.h.slice(0, query.h.length / 2);
      const testHeightSecond = query.h.slice((query.h.length / 2));
      if (testHeightFirst === testHeightSecond) {
        query.h = testHeightFirst;
      }
    }
    if (query.f) format.filter = 'Point';
    format.resize.width = (query.w && !isNaN(parseInt(query.w, 10))) ? parseInt(query.w, 10) : null;
    format.resize.height =
      (query.h && !isNaN(parseInt(query.h, 10))) ? parseInt(query.h, 10) : null;
    if (format.resize.height !== null && format.resize.width !== null) {
      format.crop = { width: format.resize.width, height: format.resize.height };
    }
  }
  if (query.f) format.filter = query.f;
  if (query.q && !isNaN(parseInt(query.q, 10))) format.quality = parseInt(query.q, 10);
  if (query.m && !isNaN(parseInt(query.m, 10))) format.max = parseInt(query.m, 10);
  if (query.b && query.b.match(/[0-9]{1,}x[0-9]{1,}/g)) format.blur = query.b.split('x');
  return format;
}

module.exports = parseQueryParameters;
