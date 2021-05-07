package cc.fovea.openwith;

import android.util.Base64;
import android.util.Base64OutputStream;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * Convert an InputStream to a byte array.
 * <p>
 * Sourced from Google guava classes.
 */
public final class ByteStreams {

    private ByteStreams() {
    }

    public static String toBase64(final InputStream in) throws IOException, OutOfMemoryError {
        byte[] buffer = new byte[3 * 1024];
        int len = 0;

        final BufferedInputStream bufferedInputStream = new BufferedInputStream(in);
        ByteArrayOutputStream output = new ByteArrayOutputStream(Math.max(32, bufferedInputStream.available()));
        Base64OutputStream output64 = new Base64OutputStream(output, Base64.NO_WRAP);

        while ((len = bufferedInputStream.read(buffer)) >= 0) {
            output64.write(buffer, 0, len);
        }

        output64.flush();
        output64.close();

        String result = new String(output.toByteArray(), "UTF-8");

        output.close();
        bufferedInputStream.close();

        return result;
    }
}
// vim: ts=4:sw=4:et
