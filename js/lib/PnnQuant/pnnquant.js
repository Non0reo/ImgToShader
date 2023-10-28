/* Fast pairwise nearest neighbor based algorithm for multilevel thresholding
Copyright (C) 2004-2019 Mark Tyler and Dmitry Groshev
Copyright (c) 2018-2023 Miller Cy Chan
* error measure; time used is proportional to number of bins squared - WJ */

(function(){
	if(!Math.clamp) {
		Math.clamp = function(a,b,c){
			return this.max(b, this.min(c, a));
		};
	}
	
	function PnnQuant(opts) {
		this.opts = opts;
		this.hasSemiTransparency = false;
		this.m_transparentPixelIndex = -1;
		this.m_transparentColor = 0xffffff;
		this.palette = [];
		this.qPixels = [];
	}
		
	
	var alphaThreshold = 0xF, hasAlpha = false, hasSemiTransparency = false, transparentColor;
	var PR = 0.299, PG = 0.587, PB = 0.114, PA = .3333;
	var ratio = .5;
	var closestMap = new Map(), nearestMap = new Map();
	
	var coeffs = [
		[0.299, 0.587, 0.114],
		[-0.14713, -0.28886, 0.436],
		[0.615, -0.51499, -0.10001]
	];
	
	function PnnBin() {
		this.ac = this.rc = this.gc = this.bc = 0;
		this.cnt = this.err = 0.0;
		this.nn = this.fw = this.bk = this.tm = this.mtm = 0;
	}
	
	function getARGBIndex(a, r, g, b, hasSemiTransparency, hasTransparency) {
		if (hasSemiTransparency)
			return (a & 0xF0) << 8 | (r & 0xF0) << 4 | (g & 0xF0) | (b >> 4);
		if (hasTransparency)
			return (a & 0x80) << 8 | (r & 0xF8) << 7 | (g & 0xF8) << 2 | (b >> 3);
		return (r & 0xF8) << 8 | (g & 0xFC) << 3 | (b >> 3);
	}
	
	function sqr(value) {
		return value * value;
	}
	
	function find_nn(bins, idx) {
		var nn = 0;
		var err = 1e100;

		var bin1 = bins[idx];
		var n1 = bin1.cnt;
		var wa = bin1.ac;
		var wr = bin1.rc;
		var wg = bin1.gc;
		var wb = bin1.bc;
		
		var start = 0;
		if(TELL_BLUE_NOISE[idx & 4095] > -88)
			start = (PG < coeffs[0][1]) ? coeffs.length : 1;
		
		for (var i = bin1.fw; i != 0; i = bins[i].fw)
		{
			var n2 = bins[i].cnt, nerr2 = (n1 * n2) / (n1 + n2);
			if (nerr2 >= err)
				continue;
			
			var nerr = 0.0;
			if(hasSemiTransparency) {
				start = 1;
				nerr += nerr2 * (1 - ratio) * PA * sqr(bins[i].ac - wa);
				if (nerr >= err)
					continue;
			}
			
			nerr += nerr2 * (1 - ratio) * PR * sqr(bins[i].rc - wr);
			if (nerr >= err)
				continue;

			nerr += nerr2 * (1 - ratio) * PG * sqr(bins[i].gc - wg);
			if (nerr >= err)
				continue;

			nerr += nerr2 * (1 - ratio) * PB * sqr(bins[i].bc - wb);
			if (nerr >= err)
				continue;
			
			for (var j = start; j < coeffs.length; ++j) {
				nerr += nerr2 * ratio * sqr(coeffs[j][0] * (bins[i].rc - wr));
				if (nerr >= err)
					break;
				
				nerr += nerr2 * ratio * sqr(coeffs[j][1] * (bins[i].gc - wg));
				if (nerr >= err)
					break;
				
				nerr += nerr2 * ratio * sqr(coeffs[j][2] * (bins[i].bc - wb));
				if (nerr >= err)
					break;
			}
			
			err = nerr;
			nn = i;
		}
		bin1.err = Math.fround(err);
		bin1.nn = nn;
	}
	
	function getQuanFn(nMaxColors, quan_rt) {
		if (quan_rt > 0) {
			if (nMaxColors < 64)
				return function(cnt) { return Math.fround(Math.sqrt(cnt)); };
			return function(cnt) { return Math.sqrt(cnt) | 0; };
		}
		if (quan_rt < 0)
			return function(cnt) { return Math.cbrt(cnt) | 0; };
		return function(cnt) { return cnt; };
	}
	
	PnnQuant.prototype.pnnquan = function pnnquan(pixels, nMaxColors) {
		var quan_rt = 1;
		var bins = new Array(65536);

		/* Build histogram */
		for (var i = 0; i < pixels.length; ++i)
		{
			var r = pixels[i] & 0xff,
			g = (pixels[i] >>> 8) & 0xff,
			b = (pixels[i] >>> 16) & 0xff,
			a = (pixels[i] >>> 24) & 0xff;
			
			if (a <= alphaThreshold) {
				r = this.m_transparentColor & 0xff,
				g = (this.m_transparentColor >>> 8) & 0xff,
				b = (this.m_transparentColor >>> 16) & 0xff,
				a = (this.m_transparentColor >>> 24) & 0xff;
			}
			
			var index = getARGBIndex(a, r, g, b, this.hasSemiTransparency, nMaxColors < 64 || this.m_transparentPixelIndex >= 0);
			if (bins[index] == null)
				bins[index] = new PnnBin();
			var tb = bins[index];
			tb.ac += a;
			tb.rc += r;
			tb.gc += g;
			tb.bc += b;
			tb.cnt += 1.0;
		}

		/* Cluster nonempty bins at one end of array */
		var maxbins = 0;
		for (var i = 0; i < bins.length; ++i)
		{
			if (bins[i] == null)
				continue;

			var d = 1.0 / bins[i].cnt;
			bins[i].ac *= d;
			bins[i].rc *= d;
			bins[i].gc *= d;
			bins[i].bc *= d;

			bins[maxbins++] = bins[i];
		}
		
		if(nMaxColors < 16)
			quan_rt = -1;
		
		var weight = this.opts.weight = Math.min(0.9, nMaxColors * 1.0 / maxbins);
		if (weight < .03 && PG < 1 && PG >= coeffs[0][1]) {
			PR = PG = PB = PA = 1;
			if (nMaxColors >= 64)
				quan_rt = 0;
		}
		
		var quanFn = getQuanFn(nMaxColors, quan_rt);
		
		var j = 0;
		for (; j < maxbins - 1; ++j)
		{
			bins[j].fw = j + 1;
			bins[j + 1].bk = j;
			bins[j].cnt = quanFn(bins[j].cnt);
		}
		bins[j].cnt = quanFn(bins[j].cnt);

		var h, l, l2;
		/* Initialize nearest neighbors and build heap of them */
		var heap = new Uint32Array(bins.length + 1);
		for (var i = 0; i < maxbins; ++i)
		{
			find_nn(bins, i);
			/* Push slot on heap */
			var err = bins[i].err;
			for (l = ++heap[0]; l > 1; l = l2)
			{
				l2 = l >> 1;
				if (bins[h = heap[l2]].err <= err)
					break;
				heap[l] = h;
			}
			heap[l] = i;
		}

		/* Merge bins which increase error the least */
		var extbins = maxbins - nMaxColors;
		for (var i = 0; i < extbins;)
		{
			var tb;
			/* Use heap to find which bins to merge */
			for (; ; )
			{
				var b1 = heap[1];
				tb = bins[b1]; /* One with least error */
				/* Is stored error up to date? */
				if ((tb.tm >= tb.mtm) && (bins[tb.nn].mtm <= tb.tm))
					break;
				if (tb.mtm == 0xFFFF) /* Deleted node */
					b1 = heap[1] = heap[heap[0]--];
				else /* Too old error value */
				{
					find_nn(bins, b1);
					tb.tm = i;
				}
				/* Push slot down */
				var err = bins[b1].err;
				for (l = 1; (l2 = l + l) <= heap[0]; l = l2)
				{
					if ((l2 < heap[0]) && (bins[heap[l2]].err > bins[heap[l2 + 1]].err))
						++l2;
					if (err <= bins[h = heap[l2]].err)
						break;
					heap[l] = h;
				}
				heap[l] = b1;
			}

			/* Do a merge */
			var nb = bins[tb.nn];
			var n1 = tb.cnt;
			var n2 = nb.cnt;
			var d = Math.fround(1.0 / (n1 + n2));
			tb.ac = d * Math.round(n1 * tb.ac + n2 * nb.ac);
			tb.rc = d * Math.round(n1 * tb.rc + n2 * nb.rc);
			tb.gc = d * Math.round(n1 * tb.gc + n2 * nb.gc);
			tb.bc = d * Math.round(n1 * tb.bc + n2 * nb.bc);
			tb.cnt += n2;
			tb.mtm = ++i;

			/* Unchain deleted bin */
			bins[nb.bk].fw = nb.fw;
			bins[nb.fw].bk = nb.bk;
			nb.mtm = 0xFFFF;
		}

		/* Fill palette */
		if(extbins < 0)
			this.palette = new Uint32Array(maxbins);
		
		var k = 0;
		for (var i = 0; ; ++k)
		{
			var a = Math.clamp(bins[i].ac, 0, 0xff) | 0,
			r = Math.clamp(bins[i].rc, 0, 0xff) | 0,
			g = Math.clamp(bins[i].gc, 0, 0xff) | 0,
			b = Math.clamp(bins[i].bc, 0, 0xff) | 0;

			this.palette[k] = (a << 24) | (b << 16) | (g << 8) | r;
			if (this.m_transparentPixelIndex >= 0 && a == 0) {
				var temp = this.palette[0];
				this.palette[0] = this.m_transparentColor;
				this.palette[k] = temp;
			}

			if ((i = bins[i].fw) == 0)
				break;
		}
	};
	
	function nearestColorIndex(palette, pixel, pos) {
		var k = 0;
		var a = (pixel >>> 24) & 0xff;
		if (a <= alphaThreshold) {
			pixel = transparentColor;
			a = (pixel >>> 24) & 0xff;
		}
		
		var nearest = nearestMap.get(pixel);
		if (nearest != null)
			return nearest;

		if(palette.length > 2 && hasAlpha && a > alphaThreshold)
			k = 1;

		var r = (pixel & 0xff),
		g = (pixel >>> 8) & 0xff,
		b = (pixel >>> 16) & 0xff;

		var pr = PR, pg = PG, pb = PB, pa = PA;
		if(palette.length < 3)
			pr = pg = pb = pa = 1;
		
		var mindist = 1e100;
		for (var i = k; i < palette.length; i++)
		{
			var r2 = (palette[i] & 0xff),
			g2 = (palette[i] >>> 8) & 0xff,
			b2 = (palette[i] >>> 16) & 0xff,
			a2 = (palette[i] >>> 24) & 0xff;
			var curdist = pa * sqr(a2 - a);
			if (curdist > mindist)
				continue;
			
			curdist += pr * sqr(r2 - r);
			if (curdist > mindist)
				continue;

			curdist += pg * sqr(g2 - g);
			if (curdist > mindist)
				continue;

			curdist += pb * sqr(b2 - b);
			if (curdist > mindist)
				continue;

			mindist = curdist;
			k = i;
		}
		nearestMap.set(pixel, k);
		return k;
	}
	
	function closestColorIndex(palette, pixel, pos) {
		var a = (pixel >>> 24) & 0xff;
		if (a <= alphaThreshold)
			return nearestColorIndex(palette, pixel, pos);
		
		var r = (pixel & 0xff),
		g = (pixel >>> 8) & 0xff,
		b = (pixel >>> 16) & 0xff;

		var closest = closestMap.get(pixel);
		if (!closest)
		{
			closest = new Array(4);
			closest[2] = closest[3] = 0xFFFF;
			
			var pr = PR, pg = PG, pb = PB, pa = PA;
			if(palette.length < 3)
				pr = pg = pb = pa = 1;

			for (var k = 0; k < palette.length; ++k)
			{
				var r2 = (palette[k] & 0xff),
				g2 = (palette[k] >>> 8) & 0xff,
				b2 = (palette[k] >>> 16) & 0xff,
				a2 = (palette[k] >>> 24) & 0xff;
				
				var err = pr * sqr(r2 - r);
				if (err >= closest[3])
					continue;
				
				err += pg * sqr(g2 - g);
				if (err >= closest[3])
					continue;
				
				err += pb * sqr(b2 - b);
				if (err >= closest[3])
					continue;
				
				if(hasSemiTransparency)
					err += pa * sqr(a2 - a);
				
				if (err < closest[2])
				{
					closest[1] = closest[0];
					closest[3] = closest[2];
					closest[0] = k;
					closest[2] = err;
				}
				else if (err < closest[3])
				{
					closest[1] = k;
					closest[3] = err;
				}
			}

			if (closest[3] == 0xFFFF)
				closest[1] = closest[0];
			
			closestMap.set(pixel, closest);
		}

		var MAX_ERR = palette.length << 2;
		var idx = (pos + 1) % 2;
		if (closest[3] * .67 < (closest[3] - closest[2]))
			idx = 0;		
		else if (closest[0] > closest[1])
			idx = pos % 2;
			
		if(closest[idx + 2] >= MAX_ERR || (hasAlpha && closest[idx] == 0))
			return nearestColorIndex(palette, pixel, pos);
		return closest[idx];
	}
	
	function CalcDitherPixel(a, r, g, b, clamp, rowerr, cursor, noBias)
	{
		var ditherPixel = new Int32Array(4);
		if (noBias) {
			ditherPixel[0] = clamp[((rowerr[cursor] + 0x1008) >> 4) + r];
			ditherPixel[1] = clamp[((rowerr[cursor + 1] + 0x1008) >> 4) + g];
			ditherPixel[2] = clamp[((rowerr[cursor + 2] + 0x1008) >> 4) + b];
			ditherPixel[3] = clamp[((rowerr[cursor + 3] + 0x1008) >> 4) + a];
			return ditherPixel;
		}

		ditherPixel[0] = clamp[((rowerr[cursor] + 0x2010) >> 5) + r];
		ditherPixel[1] = clamp[((rowerr[cursor + 1] + 0x1008) >> 4) + g];
		ditherPixel[2] = clamp[((rowerr[cursor + 2] + 0x2010) >> 5) + b];
		ditherPixel[3] = a;
		return ditherPixel;
	}
	
	PnnQuant.prototype.quantize_image = function quantize_image(pixels, nMaxColors, width, height, dither) {
		var qPixels = nMaxColors > 256 ? new Uint16Array(pixels.length) : new Uint8Array(pixels.length);
		var pixelIndex = 0;
		if (dither)
		{
			const DJ = 4, BLOCK_SIZE = 256, DITHER_MAX = 20;
			var err_len = (width + 2) * DJ;
			var clamp = new Int32Array(DJ * BLOCK_SIZE);
			var limtb = new Int32Array(2 * BLOCK_SIZE);

			for (var i = 0; i < BLOCK_SIZE; ++i)
			{
				clamp[i] = 0;
				clamp[i + BLOCK_SIZE] = i;
				clamp[i + BLOCK_SIZE * 2] = 0xff;
				clamp[i + BLOCK_SIZE * 3] = 0xff;

				limtb[i] = -DITHER_MAX;
				limtb[i + BLOCK_SIZE] = DITHER_MAX;
			}
			for (var i = -DITHER_MAX; i <= DITHER_MAX; ++i)
				limtb[i + BLOCK_SIZE] = i;

			var noBias = this.hasSemiTransparency || nMaxColors < 64;
			var dir = 1;
			var row0 = new Int32Array(err_len);
			var row1 = new Int32Array(err_len);
			var lookup = new Int32Array(65536);
			for (var i = 0; i < height; ++i)
			{
				if (dir < 0)
					pixelIndex += width - 1;

				var cursor0 = DJ, cursor1 = width * DJ;
				row1[cursor1] = row1[cursor1 + 1] = row1[cursor1 + 2] = row1[cursor1 + 3] = 0;
				for (var j = 0; j < width; ++j)
				{
					var r = (pixels[pixelIndex] & 0xff),
					g = (pixels[pixelIndex] >>> 8) & 0xff,
					b = (pixels[pixelIndex] >>> 16) & 0xff,
					a = (pixels[pixelIndex] >>> 24) & 0xff;

					var ditherPixel = CalcDitherPixel(a, r, g, b, clamp, row0, cursor0, noBias);
					var r_pix = ditherPixel[0];
					var g_pix = ditherPixel[1];
					var b_pix = ditherPixel[2];
					var a_pix = ditherPixel[3];

					var c1 = (a_pix << 24) | (b_pix << 16) | (g_pix <<  8) | r_pix;
					if(noBias) {
						var offset = getARGBIndex(a_pix, r_pix, g_pix, b_pix, this.hasSemiTransparency, this.m_transparentPixelIndex >= 0);
						if (lookup[offset] == 0)
							lookup[offset] = (a == 0) ? 1 : nearestColorIndex(this.palette, c1, i + j) + 1;
						qPixels[pixelIndex] = lookup[offset] - 1;
					}
					else 
						qPixels[pixelIndex] = (a == 0) ? 0 : nearestColorIndex(this.palette, c1, i + j);

					var c2 = this.palette[qPixels[pixelIndex]];
					var r2 = (c2 & 0xff),
					g2 = (c2 >>> 8) & 0xff,
					b2 = (c2 >>> 16) & 0xff,
					a2 = (c2 >>> 24) & 0xff;

					r_pix = limtb[r_pix - r2 + BLOCK_SIZE];
					g_pix = limtb[g_pix - g2 + BLOCK_SIZE];
					b_pix = limtb[b_pix - b2 + BLOCK_SIZE];
					a_pix = limtb[a_pix - a2 + BLOCK_SIZE];

					var k = r_pix * 2;
					row1[cursor1 - DJ] = r_pix;
					row1[cursor1 + DJ] += (r_pix += k);
					row1[cursor1] += (r_pix += k);
					row0[cursor0 + DJ] += (r_pix + k);

					k = g_pix * 2;
					row1[cursor1 + 1 - DJ] = g_pix;
					row1[cursor1 + 1 + DJ] += (g_pix += k);
					row1[cursor1 + 1] += (g_pix += k);
					row0[cursor0 + 1 + DJ] += (g_pix + k);

					k = b_pix * 2;
					row1[cursor1 + 2 - DJ] = b_pix;
					row1[cursor1 + 2 + DJ] += (b_pix += k);
					row1[cursor1 + 2] += (b_pix += k);
					row0[cursor0 + 2 + DJ] += (b_pix + k);

					k = a_pix * 2;
					row1[cursor1 + 3 - DJ] = a_pix;
					row1[cursor1 + 3 + DJ] += (a_pix += k);
					row1[cursor1 + 3] += (a_pix += k);
					row0[cursor0 + 3 + DJ] += (a_pix + k);

					cursor0 += DJ;
					cursor1 -= DJ;
					pixelIndex += dir;
				}
				if ((i % 2) == 1)
					pixelIndex += width + 1;

				dir *= -1;
				var temp = row0; row0 = row1; row1 = temp;
			}
			
			this.qPixels = qPixels;
			return this.qPixels;
		}

		for (var i = 0; i < qPixels.length; ++i)
			qPixels[i] = this.getDitherFn()(this.palette, pixels[i], i);

		this.qPixels = qPixels;
		return this.qPixels;
	};
	
	function processImagePixels(palette, qPixels) {
		var qPixel32s = new Uint32Array(qPixels.length);
		for (var i = 0; i < qPixels.length; ++i)
			qPixel32s[i] = palette[qPixels[i]];

		return qPixel32s;
	}
	
	PnnQuant.prototype.quantizeImage = function quantizeImage() {
		var pixels = this.opts.pixels, width = this.opts.width, height = this.opts.height,
			nMaxColors = this.opts.colors, dither = this.opts.dithering;
		if(this.opts.alphaThreshold)
			alphaThreshold = this.opts.alphaThreshold;
		
		closestMap.clear();
		nearestMap.clear();
		
		hasAlpha = false;
		var semiTransCount = 0;
		for (var i = 0; i < pixels.length; ++i) {
			var a = (pixels[i] >>> 24) & 0xff;
			
			if (a < 0xE0)
			{
				if (a == 0) {
					this.m_transparentPixelIndex = i;
					hasAlpha = true;
					if(nMaxColors > 2)
						this.m_transparentColor = pixels[i];
					else
						pixels[i] = this.m_transparentColor;
				}
				else if(a > alphaThreshold)
					++semiTransCount;
			}
		}
		
		this.hasSemiTransparency = hasSemiTransparency = semiTransCount > 0;

		if (nMaxColors <= 32)
			PR = PG = PB = PA = 1;
		else {
			PR = coeffs[0][0]; PG = coeffs[0][1]; PB = coeffs[0][2];
		}

		transparentColor = this.m_transparentColor; 
		
		this.palette = new Uint32Array(nMaxColors);
		if (nMaxColors > 2)
			this.pnnquan(pixels, nMaxColors);
		else {
			if (this.m_transparentPixelIndex >= 0)
			{
				this.palette[0] = this.m_transparentColor;
				this.palette[1] = (0xff << 24);
			}
			else
			{
				this.palette[0] = (0xff << 24);
				this.palette[1] = 0xffffffff;
			}
		}

		if (hasSemiTransparency)
			this.opts.weight *= -1;

		if (this.m_transparentPixelIndex >= 0)
		{
			var k = this.getDitherFn()(this.palette, pixels[this.m_transparentPixelIndex], this.m_transparentPixelIndex);
			if (this.palette.length > 2)
				this.palette[k] = this.m_transparentColor;
			else if (this.palette[k] != this.m_transparentColor) {
				this.palette[0] = this.palette[k];
				this.palette[k] = this.m_transparentColor;
				nearestMap.clear();
			}
		}
		
		if(this.opts.paletteOnly) {
			this.opts.ditherFn = this.getDitherFn();
			this.opts.getColorIndex = this.getColorIndex;
			this.opts.palette = this.palette;
			return this.palette;
		}
		
		this.qPixels = this.quantize_image(pixels, nMaxColors, width, height, dither);
		return processImagePixels(this.palette, this.qPixels);
	};
	
	PnnQuant.prototype.getIndexedPixels = function getIndexedPixels() {
		return this.qPixels;
	};	
	
	PnnQuant.prototype.getPalette = function getPalette() {
		return this.palette.buffer;
	};
	
	PnnQuant.prototype.getImgType = function getImgType() {
		return this.opts.colors > 256 || this.hasSemiTransparency ? "image/png" : "image/gif";
	};
	
	PnnQuant.prototype.getTransparentIndex = function getTransparentIndex() {
		return this.m_transparentPixelIndex > -1 ? 0 : -1;
	};
	
	PnnQuant.prototype.getDitherFn = function getDitherFn() {
		return this.opts.dithering ? nearestColorIndex : closestColorIndex;
	};
	
	PnnQuant.prototype.getColorIndex = function getColorIndex(a, r, g, b) {
		return getARGBIndex(a, r, g, b, this.hasSemiTransparency, this.m_transparentPixelIndex >= 0);
	};
	
	PnnQuant.prototype.getResult = function getResult() {
		var quant = this;
		return new Promise(function(resolve, reject) {
			var result = quant.quantizeImage();
			if(quant.opts.paletteOnly)
				resolve({ pal8: result, indexedPixels: quant.getIndexedPixels(), transparent: quant.getTransparentIndex(), type: quant.getImgType() });
			else
				resolve({ img8: result, pal8: quant.getPalette(), indexedPixels: quant.getIndexedPixels(), transparent: quant.getTransparentIndex(), type: quant.getImgType() });
		});
	};

	// expose
	this.PnnQuant = PnnQuant;

	// expose to commonJS
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = PnnQuant;
	}

}).call(this);
