package cc.fovea.openwith;

import android.util.Base64;
import android.util.Base64OutputStream;

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
        byte[] buffer = new byte[8192];
        int bytesRead;
        ByteArrayOutputStream output = new ByteArrayOutputStream(Math.max(32, in.available()));
        Base64OutputStream output64 = new Base64OutputStream(output, Base64.NO_WRAP);
        while ((bytesRead = in.read(buffer)) != -1) {
            output64.write(buffer, 0, bytesRead);
        }

        output64.close();
        return output.toString();
    }
}
// vim: ts=4:sw=4:et
