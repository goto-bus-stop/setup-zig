const io = @import("std").io;

pub fn main() anyerror!void {
    const stdout = try io.getStdOut();
    try stdout.write("it works!\n");
}
