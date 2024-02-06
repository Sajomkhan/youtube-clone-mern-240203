import { createError } from "../error.js";
import User from "../models/User.js";
import Video from "../models/Video.js";

export const addVideo = async (req, res, next) => {
  const newVideo = new Video({ userId: req.user.id, ...req.body });
  try {
    const saveVideo = await newVideo.save();
    res.status(200).json(saveVideo);
  } catch (err) {
    next(err);
  }
};

export const updateVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return next(createError(404, "Video not found"));
    if (req.user.id === video.userId) {
      const updatedVideo = await Video.findByIdAndUpdate(
        req.parms.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedVideo)
    } else{
        return next(createError(403, "You can not update only your video"));
    }
  } catch (err) {
    next(err);
  }
};

export const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return next(createError(404, "Video not found"));
    if (req.user.id === video.userId) {
      await Video.findByIdAndDelete( req.parms.id );
      res.status(200).json("The video has been deleted")
    } else{
        return next(createError(403, "You can delete only your video"));
    }
  } catch (err) {
    next(err);
  }
};

export const getVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id)
    res.status(200).json(video)
  } catch (err) {
    next(err);
  }
};

export const addview = async (req, res, next) => {
  try {
    await Video.findByIdAndUpdate(req.params.id, {
      $inc: {views:1}
    })
    res.status(200).json("The view has been increased")
  } catch (err) {
    next(err);
  }
};

export const random = async (req, res, next) => {
  try {
    const videos = await Video.aggregate([{ $sample: { size: 40}}])
    res.status(200).json(videos)
  } catch (err) {
    next(err);
  }
};

export const trend = async (req, res, next) => {
  try {
    const videos = await Video.find().sort({views: -1}) // views: -1 (for most views) | views: 1 (for less views) 
    res.status(200).json(videos)
  } catch (err) {
    next(err);
  }
};

export const sub = async (req, res, next) => {
  try {
   const user = await User.findById(req.user.id);
   const subscribedChannels = user.subscribedUsers

   const list = await Promise.all(
    subscribedChannels.map((channelId)=>{
      return Video.find({ userId: channelId })
    })
   )
    res.status(200).json(list)
  } catch (err) {
    next(err);
  }
};
