import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/external-client";
import { useWishlist } from "@/hooks/useWishlist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Phone, Mail, Edit, Trash2, MessageCircle, LogOut, Calendar, Package, Check, X } from "lucide-react";
import { format } from "date-fns";
import { whatsappLink } from "@/lib/whatsapp";
import { toast } from "sonner";

export default function Account() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useWishlist();

  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [localName, setLocalName] = useState("");

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`user_name_${user.id}`);
      if (stored) {
        setLocalName(stored);
      } else {
        setLocalName(user.user_metadata?.full_name || "");
      }
    }
  }, [user]);

  const handleSaveName = async () => {
    if (!editNameValue.trim()) {
      setIsEditingName(false);
      return;
    }
    setLocalName(editNameValue);
    if (user?.id) {
      localStorage.setItem(`user_name_${user.id}`, editNameValue);
    }
    
    try {
      await supabase.auth.updateUser({
        data: { full_name: editNameValue }
      });
      toast.success("Profile updated");
    } catch (err) {
      console.error(err);
      toast.success("Profile updated locally");
    }
    setIsEditingName(false);
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      setIsLoadingData(true);
      try {
        // Fetch appointments matching user phone or email
        if (user?.phone || user?.email) {
          let query = supabase.from("appointments").select("*");
          if (user?.phone && user?.email) {
            query = query.or(`phone.eq.${user.phone},email.eq.${user.email}`);
          } else if (user?.phone) {
            query = query.eq("phone", user.phone);
          } else if (user?.email) {
            query = query.eq("email", user.email);
          }
          const { data: apts } = await query.order("created_at", { ascending: false });
          if (apts) setAppointments(apts);

          let enqQuery = supabase.from("enquiries").select("*");
          if (user?.phone && user?.email) {
            enqQuery = enqQuery.or(`phone.eq.${user.phone},email.eq.${user.email}`);
          } else if (user?.phone) {
            enqQuery = enqQuery.eq("phone", user.phone);
          } else if (user?.email) {
            enqQuery = enqQuery.eq("email", user.email);
          }
          const { data: enqs } = await enqQuery.order("created_at", { ascending: false });
          if (enqs) setEnquiries(enqs);
        }

        // Fetch wishlist products
        if (wishlist.length > 0) {
          const { data: prods } = await supabase
            .from("products")
            .select("*")
            .in("id", wishlist);
          if (prods) setWishlistProducts(prods);
        } else {
          setWishlistProducts([]);
        }
      } catch (err) {
        console.error("Error loading account data:", err);
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, [user, wishlist]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A84C]" />
      </div>
    );
  }

  const accountLabel = localName || user?.user_metadata?.full_name || user?.phone || user?.email || "User";
  const initials = accountLabel.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-muted/30 pt-24 pb-12">
      <div className="container-px mx-auto max-w-5xl">
        <h1 className="text-3xl font-serif text-[#2C0A0A] mb-8">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Profile & Actions */}
          <div className="space-y-6 md:col-span-1">
            {/* Profile Card */}
            <Card className="border-[#C9A84C]/20 shadow-soft overflow-hidden">
              <div className="bg-[#2C0A0A] h-20 relative">
                <div className="absolute -bottom-10 left-6">
                  <div className="w-20 h-20 rounded-full bg-[#C9A84C] border-4 border-white flex items-center justify-center text-3xl text-white font-serif shadow-sm">
                    {initials}
                  </div>
                </div>
              </div>
              <CardContent className="pt-14 pb-6 px-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 mr-4">
                    {isEditingName ? (
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          autoFocus
                          type="text"
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          className="flex-1 bg-transparent border-b border-[#C9A84C] focus:outline-none text-xl font-semibold text-foreground"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveName();
                            if (e.key === 'Escape') setIsEditingName(false);
                          }}
                        />
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleSaveName}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setIsEditingName(false)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <h2 className="text-xl font-semibold text-foreground flex items-center justify-between">
                        {accountLabel}
                      </h2>
                    )}
                    
                    {user.email && (
                      <div className="flex items-center gap-2 text-muted-foreground mt-1 text-sm">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground mt-1 text-sm">
                        <Phone className="w-4 h-4" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                  {!isEditingName && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-[#C9A84C] hover:text-[#C9A84C]/80 hover:bg-[#C9A84C]/10"
                      onClick={() => {
                        setEditNameValue(accountLabel);
                        setIsEditingName(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-[#C9A84C]/20 shadow-soft">
              <CardContent className="p-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Content */}
          <div className="space-y-6 md:col-span-2">
            {/* Wishlist Section */}
            <Card className="border-[#C9A84C]/20 shadow-soft">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#C9A84C]" />
                  My Wishlist ({wishlist.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingData ? (
                  <div className="p-8 text-center text-muted-foreground">Loading...</div>
                ) : wishlistProducts.length > 0 ? (
                  <div className="divide-y divide-border/50">
                    {wishlistProducts.map((product) => {
                      const image = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : "";
                      const priceText = product.price_min && product.price_max
                        ? `₹${product.price_min.toLocaleString('en-IN')} - ₹${product.price_max.toLocaleString('en-IN')}`
                        : "Price on Request";

                      return (
                        <div key={product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-center sm:items-start hover:bg-muted/30 transition-colors">
                          <img src={image} alt={product.name} className="w-24 h-24 object-cover rounded-md shadow-sm bg-white" />
                          <div className="flex-1 text-center sm:text-left">
                            <h3 className="font-medium text-foreground text-lg">{product.name}</h3>
                            <p className="text-[#C9A84C] font-semibold mt-1">{priceText}</p>
                            <div className="flex items-center gap-3 mt-4 justify-center sm:justify-start">
                              <Button
                                onClick={() => {
                                  toggleWishlist(product.id);
                                  setWishlistProducts(prev => prev.filter(p => p.id !== product.id));
                                  toast.success("Removed from wishlist");
                                }}
                                variant="outline"
                                size="sm"
                                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove
                              </Button>
                              <a
                                href={whatsappLink(`Hello, I would like to enquire about the ${product.name}.`)}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Button size="sm" className="bg-[#25D366] hover:bg-[#25D366]/90 text-white">
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Enquire
                                </Button>
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    Your wishlist is empty.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Appointments Section */}
            <Card className="border-[#C9A84C]/20 shadow-soft">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#C9A84C]" />
                  My Appointments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingData ? (
                  <div className="p-8 text-center text-muted-foreground">Loading...</div>
                ) : appointments.length > 0 ? (
                  <div className="divide-y divide-border/50">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground capitalize">{apt.appointment_type.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {apt.preferred_date ? format(new Date(apt.preferred_date), "MMM d, yyyy 'at' h:mm a") : "No date specified"}
                          </p>
                        </div>
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                          apt.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No appointments found.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enquiries Section */}
            <Card className="border-[#C9A84C]/20 shadow-soft">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-[#C9A84C]" />
                  My Enquiries
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingData ? (
                  <div className="p-8 text-center text-muted-foreground">Loading...</div>
                ) : enquiries.length > 0 ? (
                  <div className="divide-y divide-border/50">
                    {enquiries.map((enq) => (
                      <div key={enq.id} className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <p className="font-medium text-foreground">{enq.name}</p>
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                            enq.status === 'new' ? 'bg-blue-100 text-blue-800' :
                            enq.status === 'contacted' ? 'bg-amber-100 text-amber-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {enq.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{enq.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(enq.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No enquiries found.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
