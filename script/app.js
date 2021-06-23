const vertexShader = `
  attribute vec2 position;
  attribute vec2 texcoord;

  uniform mat3 u_matrix;

  varying vec2 v_texcoord;

  void main() {
    gl_Position = vec4(u_matrix * vec3(position, 1), 1);
    v_texcoord = texcoord;
  }
`;

const fragShader = `
  precision mediump float;
  varying vec2 v_texcoord;
  uniform vec2 u_mouse;
  uniform sampler2D u_originalImage;
  uniform float iter;
  uniform float uTextureSize;
  uniform float abA;

  vec4 abColor(float div, vec2 coords) {
    // lens distortion coefficient (between
    float k = -0.2;

    // cubic distortion value
    float kcube = 0.5;

    float r2 = (coords.x-0.5)*(coords.x-0.5) + (coords.y-0.5)*(coords.y-0.5);       
    float f = 0.0;
    
    if (kcube == 0.0) {
         f = 1.0 + r2 * k;
    } else {
         f = 1.0 + r2 * (k + kcube * sqrt(r2));
    };

    float x = f * (coords.x-0.5)+0.5;
    float y = f * (coords.y-0.5)+0.5;

    vec2 newCoords = vec2(x, y);

    vec4 originalR = texture2D(u_originalImage, (newCoords - (u_mouse * 0.03)));
    vec4 originalG = texture2D(u_originalImage, (newCoords - (u_mouse * 0.01)));
    vec4 originalB = texture2D(u_originalImage, (newCoords - (u_mouse * 0.005)));
    
    return vec4(originalR.r, originalG.g, originalB.b, originalR.a + originalG.a + originalB.a) / div;
  }

  float blendColorBurn(float base, float blend) {
    return (blend==0.0)?blend:max((1.0-((1.0-base)/blend)),0.0);
  }

  float blendAverage(float base, float blend) {
    return (base+blend)/2.0;
  }

    
  float blendLighten(float base, float blend) {
    return max(blend,base);
  }

  float blendReflect(float base, float blend) {
    return (blend==1.0)?blend:min(base*base/(1.0-blend),1.0);
  }

  float blendScreen(float base, float blend) {
    return 1.0-((1.0-base)*(1.0-blend));
  }

  float blendf(float base, float blend) {
    return blendScreen(base, blend);
  }

  vec4 blend(vec4 base, vec4 blend) {
    return vec4(blendf(base.r, blend.r), blendf(base.g, blend.g), blendf(base.b, blend.b), base.a + blend.a);
  }

  void main() {
    float pixel = 1.0 / uTextureSize * length(u_mouse);
    vec2 coords;
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
    float div = (iter + 1.0) * (iter + 1.0) * 4.0;

    vec4 originalRGB = texture2D(u_originalImage, v_texcoord);

    for (int i = 0; i <= 100; i++) {
        if (float(i) > iter){
            break;
        }
        for (int j = 0; j <= 100; j++) {
            if (float(j) > iter){
                break;
            }
            coords = v_texcoord.st;
            coords += vec2(float(i), float(j)) * pixel;
            color += abColor(div, coords);
            //color += texture2D(u_originalImage, coords) / div;

            coords = v_texcoord.st;
            coords -= vec2(float(i), float(j)) * pixel;
            color += abColor(div, coords);
            //color += texture2D(u_originalImage, coords) / div;
        }

        int i2 = -i;
        for (int j = 0; j <= 100; j++) {
            if (float(j) > iter){
                break;
            }
            coords = v_texcoord.st;
            coords += vec2(float(i2), float(j)) * pixel;
            color += abColor(div, coords);
            //color += texture2D(u_originalImage, coords) / div;

            coords = v_texcoord.st;
            coords -= vec2(float(i2), float(j)) * pixel;
            color += abColor(div, coords);
            //color += texture2D(u_originalImage, coords) / div;
        }
    }

    vec4 ab = color * abA * length(u_mouse);
    
    gl_FragColor = blend(originalRGB, ab);
  }
`;


function main() {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById("logo");
    const gl = canvas.getContext("webgl");
    if (!gl) {
      return;
    }
  
    let originalImage = { width: 1, height: 1 }; // replaced after loading
    const originalTexture = twgl.createTexture(gl, {
      src: "/img/LG_Logo_hero.png", 
      crossOrigin: '',
      premultiplyAlpha: true,
    }, (err, texture, source) => {
      originalImage = source;
    });
    
    // compile shaders, link program, lookup location
    const programInfo = twgl.createProgramInfo(gl, [vertexShader, fragShader]);
  
    // calls gl.createBuffer, gl.bindBuffer, gl.bufferData for a quad
    const bufferInfo = twgl.primitives.createXYQuadBufferInfo(gl);
  
    const mouse = [0, 0];

    const canvasMidX = (gl.canvas.clientWidth / 2);
    const canvasMidY = (gl.canvas.clientHeight / 2);
    canvas.addEventListener('mousemove', (event) => {
      mouse[0] = (event.offsetX - canvasMidX) / canvasMidX;
      mouse[1] = (event.offsetY - canvasMidY) / canvasMidY;
    });
      
      canvas.addEventListener('mouseout', (event) => {
      mouse[0] = 0;
      mouse[1] = 0;
    });
      
      canvas.addEventListener('touchmove', (event) => {
        mouse[0] = (event.offsetX - canvasMidX) / canvasMidX;
        mouse[1] = (event.offsetY - canvasMidY) / canvasMidY;
    });
      
      canvas.addEventListener('touchend', (event) => {
      mouse[0] = 0;
      mouse[1] = 0;
    });
      
      var nMouse = [0, 0];
      var oMouse = [0, 0];
    
    requestAnimationFrame(render);

    function lerp (start, end, amt){
      return (1-amt)*start+amt*end;
    }
    
    function render() {
      
      twgl.resizeCanvasToDisplaySize(gl.canvas);
  
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
  
      gl.useProgram(programInfo.program);
  
      // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
      twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
  
      const canvasAspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      const imageAspect = originalImage.width / originalImage.height;
      const mat = m3.scaling(imageAspect / canvasAspect, -1);
          
      nMouse = [lerp(nMouse[0], mouse[0], 0.1), lerp(nMouse[1], mouse[1], 0.05)];
              
      // calls gl.activeTexture, gl.bindTexture, gl.uniformXXX
      twgl.setUniforms(programInfo, {
        u_matrix: mat,
        u_originalImage: originalTexture,
        u_mouse: nMouse,
        iter: 5,
        uTextureSize: 512.0,
        abA: 0.4
      });
          
      // calls gl.drawArrays or gl.drawElements
      twgl.drawBufferInfo(gl, bufferInfo);
      
      requestAnimationFrame(render);
    }
  }
  
  main();

  lax.init();

  // Add a driver that we use to control our animations
  lax.addDriver('scrollY', function () {
    return window.scrollY;
  });