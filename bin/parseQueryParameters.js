

function parseQueryParameters(query) {
  const format = {};
  if ((query.w && parseInt(query.w) !== NaN) || (query.h && parseInt(query.h) !== NaN)) {
    format.gravity = 'Center';
    format.resize = {};
    if (query.h && query.h.length > 4) {
      const test_height_first = query.h.slice(0, query.h.length / 2);
      const test_height_second = query.h.slice((query.h.length / 2));
      if (test_height_first == test_height_second) {
        query.h = test_height_first;
      }
    }
    if (query.f) format.filter = 'Point';
    format.resize.width = (query.w && parseInt(query.w) !== NaN) ? parseInt(query.w) : null;
    format.resize.height = (query.h && parseInt(query.h) !== NaN) ? parseInt(query.h) : null;
    if (format.resize.height !== null && format.resize.width !== null) format.crop = { width: format.resize.width, height: format.resize.height };
  }
  if (query.f) format.filter = query.f;
  if (query.q && parseInt(query.q) !== NaN) format.quality = parseInt(query.q);
  if (query.m && parseInt(query.m) !== NaN) format.max = parseInt(query.m);
  if (query.b && query.b.match(/[0-9]{1,}x[0-9]{1,}/g)) format.blur = query.b.split('x');
  return format;
}

module.exports = parseQueryParameters;
