import cloudinary.uploader

def upload_image_to_cloudinary(file_stream, public_id=None):
    result = cloudinary.uploader.upload(file_stream, public_id=public_id)
    return result.get("secure_url")