import { Payment } from "@/models/payment";
import { getAllPayments, saveAllPayments } from "@/services/PaymentRepository";
import CryptoJS from "crypto-js";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

const BACKUP_VERSION = 1;
const BACKUP_MAGIC = "TAPTRACK_BACKUP_V1";

interface BackupEnvelope {
    magic: string;
    version: number;
    createdAt: number;
    paymentCount: number;
    ciphertext: string;
}

export async function exportEncryptedBackup(password: string): Promise<string> {
    if (!password || password.length < 4) {
        throw new Error("Password must be at least 4 characters.");
    }

    const payments = await getAllPayments();
    const plaintext = JSON.stringify(payments);
    const ciphertext = CryptoJS.AES.encrypt(plaintext, password).toString();

    const envelope: BackupEnvelope = {
        magic: BACKUP_MAGIC,
        version: BACKUP_VERSION,
        createdAt: Date.now(),
        paymentCount: payments.length,
        ciphertext,
    };

    const fileName = `taptrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(envelope), {
        encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
            mimeType: "application/json",
            dialogTitle: "Save TapTrack Backup",
            UTI: "public.json",
        });
    }

    return fileUri;
}

export async function importEncryptedBackup(password: string): Promise<number> {
    const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
    });

    if (result.canceled || result.assets.length === 0) {
        return 0;
    }

    const fileUri = result.assets[0].uri;
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
    });

    let envelope: BackupEnvelope;
    try {
        envelope = JSON.parse(fileContent);
    } catch {
        throw new Error("Not a valid backup file.");
    }

    if (envelope.magic !== BACKUP_MAGIC) {
        throw new Error("This file isn't a TapTrack backup.");
    }
    if (envelope.version !== BACKUP_VERSION) {
        throw new Error(`Backup version ${envelope.version} isn't supported by this app.`);
    }

    let plaintext: string;
    try {
        const bytes = CryptoJS.AES.decrypt(envelope.ciphertext, password);
        plaintext = bytes.toString(CryptoJS.enc.Utf8);
    } catch {
        throw new Error("Wrong password or corrupted backup.");
    }

    if (!plaintext) {
        throw new Error("Wrong password.");
    }

    let payments: Payment[];
    try {
        payments = JSON.parse(plaintext);
    } catch {
        throw new Error("Backup content is corrupted.");
    }

    await saveAllPayments(payments);
    return payments.length;
}
