package com.example.testandroid;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import android.os.Build;
import android.os.Bundle;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Context;
import android.graphics.Bitmap;
import android.util.Log;
import android.view.Menu;
import android.webkit.ConsoleMessage;
import android.webkit.GeolocationPermissions;
import android.webkit.JsResult;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
public class MainActivity extends Activity {

	private WebView webView;
	private ProgressDialog progressDialog;
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		webView = (WebView) findViewById(R.id.mywebview);
		setWebView();
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.main, menu);
		return true;
	}
	@SuppressLint({ "NewApi", "SetJavaScriptEnabled" })
	private void setWebView() {
		if (Build.VERSION.SDK_INT >= 16) {
			Class<?> clazz = webView.getSettings().getClass();
			Method method = null;
			try {
				method = clazz.getMethod("setAllowUniversalAccessFromFileURLs",
						boolean.class);
			} catch (NoSuchMethodException e1) {
				e1.printStackTrace();
			}
			if (method != null) {
				try {
					method.invoke(webView.getSettings(), true);
				} catch (IllegalArgumentException e) {
					e.printStackTrace();
				} catch (IllegalAccessException e) {
					e.printStackTrace();
				} catch (InvocationTargetException e) {
					e.printStackTrace();
				}
			}
		}

	       

		WebSettings webSettings = webView.getSettings();
		webSettings.setJavaScriptEnabled(true);
		webSettings.setSupportZoom(true);       //Zoom Control on web (You don't need this if ROM supports Multi-Touch )   
		webSettings.setBuiltInZoomControls(true); //Enable Multitouch if supported by ROM

		
		
		MyWebViewClient myWebViewClient = new MyWebViewClient(this);
		progressDialog = myWebViewClient.getProgressDialog();
		webView.setWebViewClient(myWebViewClient);
		webView.setWebChromeClient(new MyWebChromeClient(progressDialog));
		webView.loadUrl("file:///android_asset/index.html");
	}
}
class MyWebViewClient extends WebViewClient {
	private Context context;
	private ProgressDialog dialog;
	public MyWebViewClient() {
 	}
	public MyWebViewClient(Context _context) {
		context = _context;
		dialog = new ProgressDialog(context);
		dialog.setCancelable(true);
		dialog.setMessage("数据加载中...");
	}
	
	public ProgressDialog getProgressDialog(){
		return dialog;
	}
	@Override
	public void onPageFinished(WebView view, String url) {
		super.onPageFinished(view, url);
	}

	@Override
	public void onPageStarted(WebView view, String url, Bitmap favicon) {
		super.onPageStarted(view, url, favicon);
	}

	/**
	 * 获取webview跳转的链接
	 */
	@Override
	public boolean shouldOverrideUrlLoading(WebView view, String url) {
		
		return super.shouldOverrideUrlLoading(view, url);
	}
	
	
}


class MyWebChromeClient extends WebChromeClient {
	private ProgressDialog dialog;
	public MyWebChromeClient(){
	}
	public MyWebChromeClient(ProgressDialog dialog){
		this.dialog = dialog;
	}
	@Override
	public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
		return super.onConsoleMessage(consoleMessage);
	}

	@Override
	public boolean onJsAlert(WebView view, String url, String message,
			JsResult result) {
		return super.onJsAlert(view, url, message, result);
	}

	@Override
	public void onGeolocationPermissionsShowPrompt(String origin, 
		GeolocationPermissions.Callback callback) { 
		callback.invoke(origin, true, false); 
		super.onGeolocationPermissionsShowPrompt(origin, callback); 
	} 
	@Override
	/*处理进度条*/
	public void onProgressChanged(WebView view, int newProgress) {
		if(null != dialog){
			if(70 <= newProgress){
				dialog.dismiss();
			}else{
				if(!dialog.isShowing()){
					dialog.show();
				}
			}
		}
		Log.i("progress",""+newProgress+view.getUrl());
        super.onProgressChanged(view, newProgress);
    }
}